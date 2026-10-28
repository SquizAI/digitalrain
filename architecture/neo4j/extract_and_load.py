#!/usr/bin/env python3
"""
DigitalRain Architecture Extractor
Uses langextract + Gemini to scan the codebase, extract structured data,
generate Cypher, and load into Neo4j.

Usage:
    python extract_and_load.py --repo-path /path/to/repo
    python extract_and_load.py --repo-path /path/to/repo --neo4j-uri bolt://localhost:7687
"""

import argparse
import json
import os
import re
import sys
import time
from pathlib import Path

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
NEO4J_URI = os.environ.get("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.environ.get("NEO4J_USER", "neo4j")
NEO4J_PASS = os.environ.get("NEO4J_PASS", "repoanalysis")

SKIP_DIRS = {
    "node_modules", ".git", "dist", "build", "backup", "backup_before_cleanup",
    "__pycache__", ".venv", ".next", "target", "vendor", ".cache", "coverage",
    "architecture"
}

SOURCE_EXTENSIONS = {
    ".js", ".ts", ".jsx", ".tsx", ".py", ".go", ".rs", ".java", ".rb",
    ".php", ".cs", ".swift", ".kt", ".scala", ".ex", ".exs", ".clj",
    ".html", ".css", ".scss", ".json", ".yaml", ".yml", ".toml",
    ".sh", ".bash", ".zsh", ".sql", ".graphql", ".proto",
    ".md", ".txt", ".plist", ".xml"
}


def collect_source_files(repo_path: str) -> list[dict]:
    """Walk the repo and collect source file contents."""
    files = []
    repo = Path(repo_path)

    for path in sorted(repo.rglob("*")):
        # Skip directories in SKIP_DIRS
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        if not path.is_file():
            continue
        if path.suffix.lower() not in SOURCE_EXTENSIONS:
            continue
        # Skip very large files
        if path.stat().st_size > 500_000:
            continue

        rel = str(path.relative_to(repo))
        try:
            content = path.read_text(encoding="utf-8", errors="replace")
        except Exception:
            continue

        loc = content.count("\n") + 1
        files.append({
            "path": rel,
            "language": detect_language(path.suffix),
            "loc": loc,
            "content": content,
        })

    return files


def detect_language(ext: str) -> str:
    mapping = {
        ".js": "javascript", ".ts": "typescript", ".jsx": "javascript",
        ".tsx": "typescript", ".py": "python", ".go": "go", ".rs": "rust",
        ".java": "java", ".rb": "ruby", ".php": "php", ".cs": "csharp",
        ".swift": "swift", ".kt": "kotlin", ".scala": "scala",
        ".html": "html", ".css": "css", ".scss": "scss",
        ".json": "json", ".yaml": "yaml", ".yml": "yaml",
        ".toml": "toml", ".sh": "bash", ".bash": "bash",
        ".sql": "sql", ".graphql": "graphql", ".proto": "protobuf",
        ".md": "markdown", ".txt": "text", ".plist": "xml", ".xml": "xml",
    }
    return mapping.get(ext.lower(), "unknown")


# ---------------------------------------------------------------------------
# Extraction via langextract + Gemini
# ---------------------------------------------------------------------------
def extract_with_langextract(files: list[dict]) -> dict:
    """Use langextract + Gemini to extract structured architecture data."""
    try:
        import langextract as lx
    except ImportError:
        print("langextract not installed, falling back to direct Gemini extraction")
        return extract_with_gemini_direct(files)

    # Build a combined source document for langextract
    combined = build_combined_document(files)

    # Define extraction schema via examples
    extraction_prompt = """
    Extract all software architecture entities from this codebase:
    - Modules (logical groupings of files)
    - Files (with path, language, LOC, type)
    - Functions (with name, file, async, exported, description)
    - Classes/Interfaces
    - Data entities/models (with fields)
    - Routes/endpoints
    - External service integrations
    - Events (emitted and subscribed)
    - Environment variables
    - Periodic jobs/scheduled tasks
    - Import relationships between files
    - Function call relationships
    - Package dependencies
    """

    examples = [
        {
            "text": "const { app, BrowserWindow } = require('electron');",
            "extraction": {
                "type": "import",
                "source_file": "main.js",
                "imports": ["app", "BrowserWindow"],
                "from_package": "electron"
            }
        },
        {
            "text": "function createMatrixWindow(display) { ... }",
            "extraction": {
                "type": "function",
                "name": "createMatrixWindow",
                "file": "main.js",
                "params": ["display"],
                "async": False,
                "exported": False,
                "description": "Create a BrowserWindow for a display"
            }
        }
    ]

    try:
        results = lx.extract(
            text=combined,
            prompt=extraction_prompt,
            examples=examples,
            model=f"gemini/{GEMINI_MODEL}",
            api_key=GEMINI_API_KEY,
        )

        # Convert langextract results to our schema
        return langextract_to_schema(results, files)

    except Exception as e:
        print(f"langextract extraction failed: {e}")
        print("Falling back to direct Gemini extraction")
        return extract_with_gemini_direct(files)


def build_combined_document(files: list[dict]) -> str:
    """Build a single document from all source files."""
    parts = []
    for f in files:
        parts.append(f"=== FILE: {f['path']} ({f['language']}, {f['loc']} LOC) ===")
        # Truncate very long files to stay within token limits
        content = f["content"]
        if len(content) > 20000:
            content = content[:20000] + "\n... [truncated]"
        parts.append(content)
        parts.append("")
    return "\n".join(parts)


def langextract_to_schema(results, files: list[dict]) -> dict:
    """Convert langextract output to our standard architecture schema."""
    schema = {
        "modules": [],
        "files": [],
        "functions": [],
        "entities": [],
        "packages": [],
        "external_services": [],
        "events": [],
        "env_vars": [],
        "jobs": [],
        "relationships": {
            "file_imports": [],
            "file_belongs_to": [],
            "function_defined_in": [],
            "function_calls": [],
            "function_reads_from": [],
            "function_writes_to": [],
            "function_calls_external": [],
            "function_subscribes_to": [],
            "function_reads_env": [],
            "file_depends_on": [],
            "module_depends_on": [],
            "job_executes": [],
        }
    }

    # Process langextract results
    if hasattr(results, "extractions"):
        for item in results.extractions:
            data = item if isinstance(item, dict) else item.__dict__
            _classify_extraction(data, schema)
    elif isinstance(results, list):
        for item in results:
            data = item if isinstance(item, dict) else getattr(item, "__dict__", {})
            _classify_extraction(data, schema)

    # Ensure files are populated from the scan
    existing_paths = {f["path"] for f in schema["files"]}
    for f in files:
        if f["path"] not in existing_paths:
            schema["files"].append({
                "path": f["path"],
                "language": f["language"],
                "loc": f["loc"],
                "type": classify_file_type(f["path"], f["content"]),
            })

    return schema


def _classify_extraction(data: dict, schema: dict):
    """Route a single extraction to the right schema bucket."""
    etype = data.get("type", "")
    if etype == "function":
        schema["functions"].append(data)
    elif etype == "import":
        schema["relationships"]["file_imports"].append(data)
    elif etype == "module":
        schema["modules"].append(data)
    elif etype in ("entity", "model", "class"):
        schema["entities"].append(data)
    elif etype == "event":
        schema["events"].append(data)
    elif etype == "package":
        schema["packages"].append(data)
    elif etype in ("external_service", "integration"):
        schema["external_services"].append(data)
    elif etype in ("env_var", "environment_variable"):
        schema["env_vars"].append(data)
    elif etype in ("job", "cron", "scheduled_task"):
        schema["jobs"].append(data)


# ---------------------------------------------------------------------------
# Direct Gemini fallback (if langextract import fails)
# ---------------------------------------------------------------------------
def extract_with_gemini_direct(files: list[dict]) -> dict:
    """Use Gemini API directly to extract architecture from source files."""
    import google.generativeai as genai

    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel(GEMINI_MODEL)

    combined = build_combined_document(files)

    prompt = f"""You are a code architecture analyzer. Analyze the following codebase and extract ALL architecture entities and relationships.

{combined}

Return a JSON object with this exact structure:
{{
  "modules": [
    {{"name": "...", "directory": "...", "description": "..."}}
  ],
  "files": [
    {{"path": "...", "language": "...", "loc": 0, "type": "..."}}
  ],
  "functions": [
    {{"name": "...", "file": "...", "async": false, "exported": false, "description": "..."}}
  ],
  "entities": [
    {{"name": "...", "table": "in-memory", "fields_json": "..."}}
  ],
  "packages": [
    {{"name": "...", "version": "...", "dev_only": false}}
  ],
  "external_services": [
    {{"name": "...", "type": "...", "purpose": "..."}}
  ],
  "events": [
    {{"name": "...", "payload_schema": "..."}}
  ],
  "env_vars": [
    {{"key": "...", "required": false, "default_value": "...", "used_by": "..."}}
  ],
  "jobs": [
    {{"name": "...", "schedule": "...", "handler": "..."}}
  ],
  "relationships": {{
    "file_imports": [
      {{"from": "file.js", "to": "other.js", "type": "require|import|script|link"}}
    ],
    "file_belongs_to": [
      {{"file": "file.js", "module": "module-name"}}
    ],
    "function_defined_in": [
      {{"function": "funcName", "file": "file.js"}}
    ],
    "function_calls": [
      {{"caller": "funcA", "callee": "funcB"}}
    ],
    "function_reads_from": [
      {{"function": "funcName", "entity": "EntityName"}}
    ],
    "function_writes_to": [
      {{"function": "funcName", "entity": "EntityName"}}
    ],
    "function_calls_external": [
      {{"function": "funcName", "service": "ServiceName"}}
    ],
    "function_subscribes_to": [
      {{"function": "funcName", "event": "eventName"}}
    ],
    "function_reads_env": [
      {{"function": "funcName", "env_var": "VAR_NAME"}}
    ],
    "file_depends_on": [
      {{"file": "file.js", "package": "pkg-name"}}
    ],
    "module_depends_on": [
      {{"from": "moduleA", "to": "moduleB", "reason": "..."}}
    ],
    "job_executes": [
      {{"job": "jobName", "function": "funcName"}}
    ]
  }}
}}

Be exhaustive. Extract EVERY function, EVERY import, EVERY relationship you can find in the code.
Return ONLY valid JSON, no markdown fences."""

    print("Calling Gemini for full architecture extraction...")
    response = model.generate_content(
        prompt,
        generation_config=genai.GenerationConfig(
            temperature=0.1,
            max_output_tokens=8192,
        ),
    )

    text = response.text.strip()
    # Strip markdown fences if present
    text = re.sub(r"^```json\s*", "", text)
    text = re.sub(r"\s*```$", "", text)

    return json.loads(text)


# ---------------------------------------------------------------------------
# File type classification
# ---------------------------------------------------------------------------
def classify_file_type(path: str, content: str) -> str:
    p = path.lower()
    if p.endswith((".json", ".yaml", ".yml", ".toml", ".plist", ".xml")):
        return "config"
    if p.endswith((".sh", ".bash")):
        return "script"
    if p.endswith(".md"):
        return "docs"
    if p.endswith(".css") or p.endswith(".scss"):
        return "stylesheet"
    if p.endswith(".html"):
        return "html-shell"
    if "test" in p or "spec" in p:
        return "test"
    # Infer from content
    if "require('electron')" in content or "from 'electron'" in content:
        if "BrowserWindow" in content and "app.whenReady" in content:
            return "main-process"
    if "requestAnimationFrame" in content or "canvas" in content.lower():
        return "renderer"
    return "source"


# ---------------------------------------------------------------------------
# Cypher Generation
# ---------------------------------------------------------------------------
def escape_cypher(s) -> str:
    """Escape a string for Cypher."""
    if s is None:
        return ""
    return str(s).replace("\\", "\\\\").replace("'", "\\'").replace('"', '\\"')


def schema_to_cypher(schema: dict) -> str:
    """Convert extracted schema to Cypher CREATE/MATCH statements."""
    lines = [
        "// ==========================================",
        "// AUTO-GENERATED by extract_and_load.py",
        f"// Generated: {time.strftime('%Y-%m-%d %H:%M:%S')}",
        "// langextract + Gemini → Cypher → Neo4j",
        "// ==========================================",
        "",
    ]

    # Modules
    lines.append("// --- MODULES ---")
    for m in schema.get("modules", []):
        name = escape_cypher(m.get("name", ""))
        directory = escape_cypher(m.get("directory", ""))
        desc = escape_cypher(m.get("description", ""))
        lines.append(
            f"CREATE (:Module {{name: '{name}', directory: '{directory}', description: '{desc}'}});"
        )
    lines.append("")

    # Files
    lines.append("// --- FILES ---")
    for f in schema.get("files", []):
        path = escape_cypher(f.get("path", ""))
        lang = escape_cypher(f.get("language", ""))
        loc = f.get("loc", 0)
        ftype = escape_cypher(f.get("type", "source"))
        lines.append(
            f"CREATE (:File {{path: '{path}', language: '{lang}', loc: {loc}, type: '{ftype}'}});"
        )
    lines.append("")

    # Functions
    lines.append("// --- FUNCTIONS ---")
    for fn in schema.get("functions", []):
        name = escape_cypher(fn.get("name", ""))
        file = escape_cypher(fn.get("file", ""))
        is_async = "true" if fn.get("async") else "false"
        exported = "true" if fn.get("exported") else "false"
        desc = escape_cypher(fn.get("description", ""))
        lines.append(
            f"CREATE (:Function {{name: '{name}', file: '{file}', async: {is_async}, exported: {exported}, description: '{desc}'}});"
        )
    lines.append("")

    # Entities
    lines.append("// --- ENTITIES ---")
    for e in schema.get("entities", []):
        name = escape_cypher(e.get("name", ""))
        table = escape_cypher(e.get("table", "in-memory"))
        fields = escape_cypher(e.get("fields_json", "{}"))
        lines.append(
            f"CREATE (:Entity {{name: '{name}', table: '{table}', fields_json: '{fields}'}});"
        )
    lines.append("")

    # Packages
    lines.append("// --- PACKAGES ---")
    for p in schema.get("packages", []):
        name = escape_cypher(p.get("name", ""))
        version = escape_cypher(p.get("version", ""))
        dev = "true" if p.get("dev_only") else "false"
        lines.append(
            f"CREATE (:Package {{name: '{name}', version: '{version}', dev_only: {dev}}});"
        )
    lines.append("")

    # External Services
    lines.append("// --- EXTERNAL SERVICES ---")
    for s in schema.get("external_services", []):
        name = escape_cypher(s.get("name", ""))
        stype = escape_cypher(s.get("type", ""))
        purpose = escape_cypher(s.get("purpose", ""))
        lines.append(
            f"CREATE (:ExternalService {{name: '{name}', type: '{stype}', purpose: '{purpose}'}});"
        )
    lines.append("")

    # Events
    lines.append("// --- EVENTS ---")
    for e in schema.get("events", []):
        name = escape_cypher(e.get("name", ""))
        payload = escape_cypher(e.get("payload_schema", ""))
        lines.append(
            f"CREATE (:Event {{name: '{name}', payload_schema: '{payload}'}});"
        )
    lines.append("")

    # EnvVars
    lines.append("// --- ENV VARS ---")
    for e in schema.get("env_vars", []):
        key = escape_cypher(e.get("key", ""))
        req = "true" if e.get("required") else "false"
        default = escape_cypher(e.get("default_value", ""))
        used = escape_cypher(e.get("used_by", ""))
        lines.append(
            f"CREATE (:EnvVar {{key: '{key}', required: {req}, default_value: '{default}', used_by: '{used}'}});"
        )
    lines.append("")

    # Jobs
    lines.append("// --- JOBS ---")
    for j in schema.get("jobs", []):
        name = escape_cypher(j.get("name", ""))
        schedule = escape_cypher(j.get("schedule", ""))
        handler = escape_cypher(j.get("handler", ""))
        lines.append(
            f"CREATE (:Job {{name: '{name}', schedule: '{schedule}', handler: '{handler}'}});"
        )
    lines.append("")

    # --- RELATIONSHIPS ---
    rels = schema.get("relationships", {})

    lines.append("// ==========================================")
    lines.append("// RELATIONSHIPS")
    lines.append("// ==========================================")
    lines.append("")

    # File imports
    lines.append("// --- FILE IMPORTS ---")
    for r in rels.get("file_imports", []):
        f = escape_cypher(r.get("from", ""))
        t = escape_cypher(r.get("to", ""))
        rt = escape_cypher(r.get("type", "import"))
        lines.append(
            f"MATCH (a:File {{path: '{f}'}}), (b:File {{path: '{t}'}}) "
            f"CREATE (a)-[:IMPORTS {{type: '{rt}'}}]->(b);"
        )
    lines.append("")

    # File belongs_to module
    lines.append("// --- FILE → MODULE ---")
    for r in rels.get("file_belongs_to", []):
        f = escape_cypher(r.get("file", ""))
        m = escape_cypher(r.get("module", ""))
        lines.append(
            f"MATCH (f:File {{path: '{f}'}}), (m:Module {{name: '{m}'}}) "
            f"CREATE (f)-[:BELONGS_TO]->(m);"
        )
    lines.append("")

    # Function defined_in
    lines.append("// --- FUNCTION → FILE ---")
    for r in rels.get("function_defined_in", []):
        fn = escape_cypher(r.get("function", ""))
        f = escape_cypher(r.get("file", ""))
        lines.append(
            f"MATCH (fn:Function {{name: '{fn}'}}), (f:File {{path: '{f}'}}) "
            f"CREATE (fn)-[:DEFINED_IN]->(f);"
        )
    lines.append("")

    # Function calls
    lines.append("// --- FUNCTION CALLS ---")
    for r in rels.get("function_calls", []):
        a = escape_cypher(r.get("caller", ""))
        b = escape_cypher(r.get("callee", ""))
        lines.append(
            f"MATCH (a:Function {{name: '{a}'}}), (b:Function {{name: '{b}'}}) "
            f"CREATE (a)-[:CALLS]->(b);"
        )
    lines.append("")

    # Function reads_from entity
    lines.append("// --- FUNCTION → ENTITY (READS) ---")
    for r in rels.get("function_reads_from", []):
        fn = escape_cypher(r.get("function", ""))
        e = escape_cypher(r.get("entity", ""))
        lines.append(
            f"MATCH (fn:Function {{name: '{fn}'}}), (e:Entity {{name: '{e}'}}) "
            f"CREATE (fn)-[:READS_FROM]->(e);"
        )
    lines.append("")

    # Function writes_to entity
    lines.append("// --- FUNCTION → ENTITY (WRITES) ---")
    for r in rels.get("function_writes_to", []):
        fn = escape_cypher(r.get("function", ""))
        e = escape_cypher(r.get("entity", ""))
        lines.append(
            f"MATCH (fn:Function {{name: '{fn}'}}), (e:Entity {{name: '{e}'}}) "
            f"CREATE (fn)-[:WRITES_TO]->(e);"
        )
    lines.append("")

    # Function calls_external
    lines.append("// --- FUNCTION → EXTERNAL ---")
    for r in rels.get("function_calls_external", []):
        fn = escape_cypher(r.get("function", ""))
        s = escape_cypher(r.get("service", ""))
        lines.append(
            f"MATCH (fn:Function {{name: '{fn}'}}), (s:ExternalService {{name: '{s}'}}) "
            f"CREATE (fn)-[:CALLS_EXTERNAL]->(s);"
        )
    lines.append("")

    # Function subscribes_to event
    lines.append("// --- FUNCTION → EVENT ---")
    for r in rels.get("function_subscribes_to", []):
        fn = escape_cypher(r.get("function", ""))
        e = escape_cypher(r.get("event", ""))
        lines.append(
            f"MATCH (fn:Function {{name: '{fn}'}}), (e:Event {{name: '{e}'}}) "
            f"CREATE (fn)-[:SUBSCRIBES_TO]->(e);"
        )
    lines.append("")

    # Function reads_env
    lines.append("// --- FUNCTION → ENV_VAR ---")
    for r in rels.get("function_reads_env", []):
        fn = escape_cypher(r.get("function", ""))
        e = escape_cypher(r.get("env_var", ""))
        lines.append(
            f"MATCH (fn:Function {{name: '{fn}'}}), (e:EnvVar {{key: '{e}'}}) "
            f"CREATE (fn)-[:READS_ENV]->(e);"
        )
    lines.append("")

    # File depends_on package
    lines.append("// --- FILE → PACKAGE ---")
    for r in rels.get("file_depends_on", []):
        f = escape_cypher(r.get("file", ""))
        p = escape_cypher(r.get("package", ""))
        lines.append(
            f"MATCH (f:File {{path: '{f}'}}), (p:Package {{name: '{p}'}}) "
            f"CREATE (f)-[:DEPENDS_ON]->(p);"
        )
    lines.append("")

    # Module depends_on module
    lines.append("// --- MODULE → MODULE ---")
    for r in rels.get("module_depends_on", []):
        a = escape_cypher(r.get("from", ""))
        b = escape_cypher(r.get("to", ""))
        reason = escape_cypher(r.get("reason", ""))
        lines.append(
            f"MATCH (a:Module {{name: '{a}'}}), (b:Module {{name: '{b}'}}) "
            f"CREATE (a)-[:DEPENDS_ON {{reason: '{reason}'}}]->(b);"
        )
    lines.append("")

    # Job executes function
    lines.append("// --- JOB → FUNCTION ---")
    for r in rels.get("job_executes", []):
        j = escape_cypher(r.get("job", ""))
        fn = escape_cypher(r.get("function", ""))
        lines.append(
            f"MATCH (j:Job {{name: '{j}'}}), (fn:Function {{name: '{fn}'}}) "
            f"CREATE (j)-[:EXECUTES]->(fn);"
        )
    lines.append("")

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Neo4j Loader
# ---------------------------------------------------------------------------
def load_into_neo4j(cypher: str):
    """Connect to Neo4j and execute the Cypher statements."""
    from neo4j import GraphDatabase

    print(f"Connecting to Neo4j at {NEO4J_URI}...")
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASS))

    with driver.session() as session:
        # Clear existing data
        print("Clearing existing graph data...")
        session.run("MATCH (n) DETACH DELETE n")

        # Execute each statement
        statements = [s.strip() for s in cypher.split(";") if s.strip() and not s.strip().startswith("//")]
        total = len(statements)
        print(f"Executing {total} Cypher statements...")

        for i, stmt in enumerate(statements, 1):
            try:
                session.run(stmt)
                if i % 20 == 0 or i == total:
                    print(f"  [{i}/{total}] statements executed")
            except Exception as e:
                print(f"  WARNING: Statement {i} failed: {e}")
                print(f"    → {stmt[:120]}...")

        # Create indexes
        print("Creating indexes...")
        indexes = [
            "CREATE INDEX file_path IF NOT EXISTS FOR (f:File) ON (f.path)",
            "CREATE INDEX module_name IF NOT EXISTS FOR (m:Module) ON (m.name)",
            "CREATE INDEX function_name IF NOT EXISTS FOR (f:Function) ON (f.name)",
            "CREATE INDEX entity_name IF NOT EXISTS FOR (e:Entity) ON (e.name)",
            "CREATE INDEX package_name IF NOT EXISTS FOR (p:Package) ON (p.name)",
            "CREATE INDEX external_name IF NOT EXISTS FOR (e:ExternalService) ON (e.name)",
            "CREATE INDEX envvar_key IF NOT EXISTS FOR (e:EnvVar) ON (e.key)",
            "CREATE INDEX event_name IF NOT EXISTS FOR (e:Event) ON (e.name)",
            "CREATE INDEX job_name IF NOT EXISTS FOR (j:Job) ON (j.name)",
        ]
        for idx in indexes:
            try:
                session.run(idx)
            except Exception:
                pass

        # Verify
        result = session.run(
            "MATCH (n) RETURN labels(n)[0] AS type, count(*) AS count ORDER BY count DESC"
        )
        print("\nGraph loaded! Node counts:")
        for record in result:
            print(f"  {record['type']}: {record['count']}")

        rel_result = session.run(
            "MATCH ()-[r]->() RETURN type(r) AS rel, count(*) AS count ORDER BY count DESC"
        )
        print("\nRelationship counts:")
        for record in rel_result:
            print(f"  {record['rel']}: {record['count']}")

    driver.close()
    print("\nDone!")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="Extract repo architecture and load into Neo4j")
    parser.add_argument("--repo-path", required=True, help="Path to the repository root")
    parser.add_argument("--neo4j-uri", default=NEO4J_URI, help="Neo4j bolt URI")
    parser.add_argument("--output-cypher", default=None, help="Save generated Cypher to file")
    parser.add_argument("--output-json", default=None, help="Save extracted JSON to file")
    parser.add_argument("--skip-neo4j", action="store_true", help="Only extract and generate Cypher, don't load")
    args = parser.parse_args()

    global NEO4J_URI
    NEO4J_URI = args.neo4j_uri

    # Step 1: Collect source files
    print(f"Scanning repo at: {args.repo_path}")
    files = collect_source_files(args.repo_path)
    print(f"Found {len(files)} source files")
    for f in files:
        print(f"  {f['path']} ({f['language']}, {f['loc']} LOC)")

    # Step 2: Extract architecture using langextract + Gemini
    print("\n--- Extracting architecture with langextract + Gemini ---")
    schema = extract_with_langextract(files)

    # Save JSON if requested
    if args.output_json:
        with open(args.output_json, "w") as f:
            json.dump(schema, f, indent=2, default=str)
        print(f"Saved extracted JSON to: {args.output_json}")

    # Step 3: Generate Cypher
    print("\n--- Generating Cypher ---")
    cypher = schema_to_cypher(schema)
    print(f"Generated {len(cypher.splitlines())} lines of Cypher")

    # Save Cypher if requested
    if args.output_cypher:
        with open(args.output_cypher, "w") as f:
            f.write(cypher)
        print(f"Saved Cypher to: {args.output_cypher}")

    # Step 4: Load into Neo4j
    if not args.skip_neo4j:
        print("\n--- Loading into Neo4j ---")
        load_into_neo4j(cypher)
    else:
        print("\nSkipping Neo4j load (--skip-neo4j)")


if __name__ == "__main__":
    main()

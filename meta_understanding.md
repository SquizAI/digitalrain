# Repo Architecture Analyzer — Claude Code Meta-Prompt

> **Usage:** Copy this entire file into any project, then tell Claude Code:
> `Read meta_understanding.md and do everything in it.`
>
> It will produce: Mermaid diagrams, a full architectural analysis, an interactive HTML viewer,
> a Dockerized Neo4j graph database, and a Gemini-powered chat interface to query it all
> in plain English.

---

## System Instructions

You are a senior software architect performing a full codebase audit. Your mission is to reverse-engineer every meaningful architectural detail of this repository and produce a comprehensive, visual-first analysis.

You will output:
1. **Mermaid diagrams** (standalone `.mmd` files + embedded in README)
2. **Markdown documentation** (full written report)
3. **Interactive HTML viewer** (single-page app that renders all diagrams in the browser)
4. **Neo4j graph database** (Dockerized, loaded with every dependency and connection)
5. **Chat interface** (HTML page where the user asks questions in English, Gemini translates to Cypher, queries the graph)
6. **Auto-extraction pipeline** (Python script using langextract + Gemini to re-extract from any repo)

**Work in phases. Complete each phase fully before moving to the next. Show your work as you go.**

---

## CRITICAL: Mermaid Syntax Rules

These rules MUST be followed in every `.mmd` file and every ```` ```mermaid ```` block. Violating them will break rendering.

### Forbidden Patterns

| Pattern | Problem | Fix |
|---------|---------|-----|
| `style` as a node ID | `style` is a reserved Mermaid keyword | Use `stylecss`, `stylesheet`, etc. |
| `A --> B & C & D` | `&` shorthand is not supported by most renderers | Write separate arrows: `A --> B` then `A --> C` then `A --> D` |
| Em-dashes `—` anywhere | Breaks parsers in labels and subgraph titles | Use regular dashes `-` |
| `()` in node IDs | Parentheses create rounded nodes | Use them only inside `["quoted labels"]` |
| `map` type in erDiagram | Not a valid erDiagram type | Use `string` instead |
| `[]` in participant aliases | Brackets break sequence diagrams | Use plural: `BrowserWindows` not `BrowserWindow[]` |
| Unicode arrows `→` in labels | Some renderers choke on these | Use plain text: `then`, `to`, or Mermaid arrows |
| `<br/>` in node labels | Works in some renderers, breaks others | Use short labels instead, or only in `["quoted"]` labels |
| `#`, `/`, `{}`, `<` in labels | Special chars in unquoted labels break parsing | Always use `["quoted labels"]` for anything with special chars |
| `direction TB` inside subgraphs | Not supported in all Mermaid versions | Remove it, or give subgraphs explicit IDs: `subgraph ID["Label"]` |

### Safe Patterns

```
flowchart TB                           %% Use flowchart, not graph
    subgraph MYID["My Label"]          %% Give subgraphs explicit IDs
        nodeA["Label with - dashes"]   %% Dashes OK, not em-dashes
        nodeB["Another label"]
    end
    nodeA --> nodeB                     %% One arrow per line
    nodeA --> nodeC                     %% No & shorthand
```

### Reserved Node IDs to Avoid

`style`, `class`, `click`, `callback`, `link`, `linkStyle`, `classDef`, `subgraph`, `end`, `graph`, `flowchart`, `direction`

---

## Phase 0 — Reconnaissance & Language Detection

Before doing anything, orient yourself:

```text
1. Run `find . -type f | head -500` and `ls -la` to get the lay of the land
2. Identify the project type(s):
   - Check for: package.json, requirements.txt, pyproject.toml, Cargo.toml, go.mod,
     pom.xml, build.gradle, Gemfile, composer.json, mix.exs, CMakeLists.txt, Makefile,
     *.sln, *.csproj, pubspec.yaml, Podfile, docker-compose.yml, serverless.yml,
     terraform/, etc.
3. Read the README.md, CONTRIBUTING.md, and any docs/ folder
4. Identify the framework(s): React, Next.js, Django, FastAPI, Rails, Spring, Express,
   NestJS, Laravel, Phoenix, Gin, Actix, ASP.NET, Flutter, SwiftUI, Electron, etc.
5. Check for monorepo structure (lerna, nx, turborepo, workspaces)
6. Identify config files: .env.example, docker-compose.yml, CI configs, infrastructure-as-code
```

**Output a brief "Repo Identity Card"** with:

- Language(s) and version(s)
- Framework(s) and version(s)
- Package manager(s)
- Monorepo? (yes/no, tool used)
- Detected architecture pattern (MVC, microservices, serverless, modular monolith, desktop app, etc.)
- Entry point file(s)
- Total file count and LOC estimate

---

## Phase 1 — Directory & Module Structure

Map the full directory tree and identify the purpose of every top-level and second-level directory.

```text
1. Run `tree -L 3 -I 'node_modules|.git|__pycache__|.venv|dist|build|.next|target|vendor' --dirsfirst`
2. For each top-level directory, read 2-3 representative files to understand its role
3. Identify the boundaries: what constitutes a "module", "service", "package", or "domain"
```

### Mermaid Output: Project Structure Map

Produce a **Mermaid flowchart** showing the directory hierarchy with annotations. Save as `architecture/01-project-structure.mmd`.

**Remember:** Use `flowchart TB`, give subgraphs explicit IDs, no reserved words as node IDs, no em-dashes, no `&` shorthand.

Adapt to match the ACTUAL repo structure. Every directory that contains meaningful code should appear.

---

## Phase 2 — Entry Points & Request Lifecycle

Trace every way data enters and exits the system.

```text
1. Identify ALL entry points:
   - HTTP routes/endpoints (REST, GraphQL, gRPC)
   - CLI commands
   - Message queue consumers (Kafka, RabbitMQ, SQS, Redis pub/sub)
   - Cron jobs / scheduled tasks
   - WebSocket handlers
   - Event listeners / webhooks
   - Lambda/serverless function handlers
   - Background workers / job processors
   - Electron lifecycle events (app.whenReady, IPC channels)
   - DOM events (DOMContentLoaded, click handlers)

2. For each entry point type, trace the FULL request lifecycle:
   - Middleware chain (auth, logging, rate limiting, CORS, validation)
   - Controller/handler
   - Service/business logic layer
   - Data access layer (ORM, raw queries, API calls)
   - Response serialization
   - Error handling path

3. Identify ALL exit points:
   - Database writes (which tables/collections)
   - External API calls (which services)
   - Message queue publishes
   - File system writes
   - Cache writes
   - Email/notification sends
   - Canvas/DOM rendering
   - Logging/analytics sinks
```

### Mermaid Output: Request Lifecycle Flowchart

Save as `architecture/02-request-lifecycle.mmd`. **Use real file names, real function names, real service names from the repo.**

---

## Phase 3 — Data Model & Database Schema

Map every data entity and its relationships.

```text
1. Find ALL model/entity definitions:
   - ORM models (SQLAlchemy, Prisma, TypeORM, ActiveRecord, Eloquent, GORM, Diesel, Ecto, etc.)
   - Database migrations (find the migrations folder, read them in order)
   - GraphQL type definitions
   - Protobuf / Avro / JSON Schema definitions
   - TypeScript interfaces/types that represent data entities
   - Pydantic models, Marshmallow schemas, Joi schemas, Zod schemas
   - In-memory state objects (CONFIG objects, state stores, caches)

2. For each entity, document:
   - All fields with types
   - Primary keys and unique constraints
   - Foreign key relationships (belongs_to, has_many, many_to_many)
   - Indexes
   - JSON/JSONB columns and their expected structure

3. Find ALL database queries that don't go through the ORM:
   - Raw SQL queries
   - Database views
   - Stored procedures
```

### Mermaid Output: Entity Relationship Diagram

Save as `architecture/03-data-model.mmd`. Use `erDiagram` syntax. **Remember:** No `map` type - use `string` instead. No special chars in field descriptions.

---

## Phase 4 — Service Dependency Map & Internal Data Flow

This is the core architectural view.

```text
1. For every file that exports functions/classes/modules:
   - What does it import? (track every import statement)
   - What does it export? (track every export)
   - What external packages does it use?

2. Group files into logical "services" or "modules" based on directory structure and domain

3. Map service-to-service communication:
   - Direct function calls between modules
   - Event-based communication (EventEmitter, signals, pub/sub)
   - Shared state (global variables, singletons, shared caches)
   - IPC channels (Electron, workers)
   - Database-mediated communication (one service writes, another reads)

4. Identify circular dependencies and flag them

5. Map the data transformation pipeline:
   - Where does data enter? (raw form)
   - How is it validated/transformed/enriched?
   - Where is it stored?
   - How is it read back and serialized for output?
```

### Mermaid Output: Service Dependency Graph

Save as `architecture/04-service-dependencies.mmd`.

### Mermaid Output: Data Flow Sequence Diagrams

For the **3 most critical user flows**, create sequence diagrams. Save each as `architecture/05-sequence-[flow-name].mmd`.

**Remember:** No brackets `[]` in participant aliases. No em-dashes in message text. No parentheses in participant names.

---

## Phase 5 — External Dependencies & Integrations

```text
1. Parse ALL dependency manifests:
   - package.json, requirements.txt, pyproject.toml, Cargo.toml, go.mod, etc.
   - Classify each: runtime vs dev vs peer/optional

2. Identify ALL external service integrations:
   - Read .env.example and config files for API keys, URLs, connection strings
   - Search for HTTP client usage (axios, fetch, requests, httpx, etc.)
   - Search for SDK initializations (AWS SDK, Firebase, Stripe, Twilio, etc.)
   - Platform APIs (macOS osascript, Windows registry, Linux D-Bus, etc.)

3. Identify ALL infrastructure dependencies:
   - Databases, message brokers, object storage, CDN, monitoring
```

### Mermaid Output: Infrastructure & Integration Map

Save as `architecture/06-infrastructure.mmd`.

---

## Phase 6 — Authentication, Authorization & Security Flow

```text
1. Trace the complete auth flow:
   - Authentication method (JWT, session, OAuth, API keys, SAML, none)
   - Where tokens are created, validated, refreshed
   - Middleware that enforces auth
   - Permission model (RBAC, ABAC, custom, none)

2. Identify security-relevant patterns:
   - Input validation, injection protections, CSRF, rate limiting
   - Content Security Policy headers
   - Secrets management approach
   - Sandbox/entitlement configuration (Electron, mobile apps)
   - If no auth exists (e.g., local desktop app), document the security model that IS present
```

### Mermaid Output: Auth/Security Flow

Save as `architecture/07-auth-flow.mmd`. For apps with no auth, create a security model flowchart instead.

---

## Phase 7 — State Management & Client Architecture

> Applies to ANY client-side code: React, Vue, Angular, Svelte, Electron renderer, Canvas apps, etc.

```text
1. Map state management:
   - Global state (Redux, Zustand, Vuex, MobX, Context, module-level variables)
   - Server state (React Query, SWR, Apollo Client)
   - Animation/render state (Canvas context, WebGL, requestAnimationFrame loops)
   - URL state / routing

2. Component/module hierarchy and data flow

3. API/rendering integration pattern
```

### Mermaid Output: Client Architecture

Save as `architecture/08-client-architecture.mmd`.

---

## Phase 8 — CI/CD, Testing & DevOps

```text
1. Map the CI/CD pipeline:
   - Read .github/workflows/, .gitlab-ci.yml, Jenkinsfile, etc.
   - Build steps, test stages, deployment targets
   - If no CI/CD exists, document the manual build/deploy process (shell scripts, etc.)

2. Testing architecture:
   - Test file locations, frameworks, mocking strategy, coverage

3. Infrastructure as Code:
   - Terraform, Docker, Kubernetes, shell scripts
```

### Mermaid Output: CI/CD Pipeline

Save as `architecture/09-cicd-pipeline.mmd`.

---

## Phase 9 — Neo4j Graph Database Generation

**Produce a fully working Docker setup with Neo4j loaded with the complete dependency graph.**

### Step 1: Create the project structure

```bash
mkdir -p architecture/neo4j/{data,import,scripts}
```

### Step 2: Generate the Cypher import script

Analyze the codebase and generate Cypher for EVERYTHING discovered in Phases 0-8.

#### Node Types (Labels)

| Label | Properties | Description |
|-------|-----------|-------------|
| `:File` | `path`, `language`, `loc`, `type` | Every source file |
| `:Module` | `name`, `directory`, `description` | Logical groupings |
| `:Function` | `name`, `file`, `params`, `returnType`, `async`, `exported` | Exported functions/methods |
| `:Class` | `name`, `file`, `type` | Classes/interfaces/enums |
| `:Route` | `method`, `path`, `handler`, `middleware[]` | API endpoints |
| `:Entity` | `name`, `table`, `fields_json` | Data models/tables |
| `:ExternalService` | `name`, `type`, `purpose` | Third-party APIs |
| `:Package` | `name`, `version`, `dev_only` | Dependencies |
| `:Database` | `name`, `type` | Data stores |
| `:EnvVar` | `key`, `required`, `default_value` | Environment variables |
| `:Event` | `name`, `payload_schema` | Events emitted/consumed |
| `:Middleware` | `name`, `file`, `order` | Middleware functions |
| `:Job` | `name`, `schedule`, `handler` | Background jobs/cron |

#### Relationship Types

| Relationship | Pattern | Description |
|-------------|---------|-------------|
| `IMPORTS` | `(:File)-[:IMPORTS]->(:File)` | File-level imports |
| `BELONGS_TO` | `(:File)-[:BELONGS_TO]->(:Module)` | File grouping |
| `DEFINED_IN` | `(:Function)-[:DEFINED_IN]->(:File)` | Function location |
| `CALLS` | `(:Function)-[:CALLS]->(:Function)` | Function call graph |
| `HANDLED_BY` | `(:Route)-[:HANDLED_BY]->(:Function)` | Route handlers |
| `USES_MIDDLEWARE` | `(:Route)-[:USES_MIDDLEWARE]->(:Middleware)` | Middleware chain |
| `EXTENDS` | `(:Class)-[:EXTENDS]->(:Class)` | Inheritance |
| `IMPLEMENTS` | `(:Class)-[:IMPLEMENTS]->(:Class)` | Interfaces |
| `HAS_RELATION` | `(:Entity)-[:HAS_RELATION {type}]->(:Entity)` | Data relationships |
| `READS_FROM` | `(:Function)-[:READS_FROM]->(:Entity)` | Data reads |
| `WRITES_TO` | `(:Function)-[:WRITES_TO]->(:Entity)` | Data writes |
| `DEPENDS_ON` | `(:Module)-[:DEPENDS_ON]->(:Module)` | Module deps |
| `CALLS_EXTERNAL` | `(:Function)-[:CALLS_EXTERNAL]->(:ExternalService)` | External calls |
| `PUBLISHES` | `(:Function)-[:PUBLISHES]->(:Event)` | Event publishing |
| `SUBSCRIBES_TO` | `(:Function)-[:SUBSCRIBES_TO]->(:Event)` | Event consumption |
| `CONNECTS_TO` | `(:Module)-[:CONNECTS_TO]->(:Database)` | DB connections |
| `READS_ENV` | `(:Function)-[:READS_ENV]->(:EnvVar)` | Env var usage |
| `EXECUTES` | `(:Job)-[:EXECUTES]->(:Function)` | Job handlers |

### Step 3: Create docker-compose.yml

Save as `architecture/neo4j/docker-compose.yml`:

```yaml
version: '3.8'

services:
  neo4j:
    image: neo4j:5-community
    container_name: repo-architecture-graph
    ports:
      - "7474:7474"
      - "7687:7687"
    environment:
      - NEO4J_AUTH=neo4j/repoanalysis
      - NEO4J_PLUGINS=["apoc"]
      - NEO4J_apoc_export_file_enabled=true
      - NEO4J_apoc_import_file_enabled=true
      - NEO4J_apoc_import_file_use__neo4j__config=true
      - NEO4J_server_memory_heap_initial__size=512m
      - NEO4J_server_memory_heap_max__size=1G
    volumes:
      - neo4j-data:/data
      - ./import:/var/lib/neo4j/import
      - ./scripts:/scripts
    healthcheck:
      test: ["CMD", "cypher-shell", "-u", "neo4j", "-p", "repoanalysis", "RETURN 1"]
      interval: 10s
      timeout: 5s
      retries: 10
    restart: unless-stopped

  graph-loader:
    image: neo4j:5-community
    container_name: repo-graph-loader
    depends_on:
      neo4j:
        condition: service_healthy
    volumes:
      - ./scripts:/scripts
    entrypoint: >
      bash -c "
        echo 'Waiting for Neo4j...' &&
        sleep 5 &&
        echo 'Loading graph data...' &&
        cat /scripts/load-graph.cypher | cypher-shell -u neo4j -p repoanalysis -a bolt://neo4j:7687 &&
        echo 'Loading indexes...' &&
        cat /scripts/create-indexes.cypher | cypher-shell -u neo4j -p repoanalysis -a bolt://neo4j:7687 &&
        echo 'Graph loaded successfully!'
      "

  chat:
    build:
      context: .
      dockerfile: Dockerfile.chat
    container_name: repo-architecture-chat
    ports:
      - "8080:8080"
    depends_on:
      neo4j:
        condition: service_healthy
    restart: unless-stopped

  extractor:
    build:
      context: .
      dockerfile: Dockerfile.chat
    container_name: repo-extractor
    volumes:
      - ./scripts:/output
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - NEO4J_URI=bolt://neo4j:7687
      - NEO4J_USER=neo4j
      - NEO4J_PASS=repoanalysis
    depends_on:
      neo4j:
        condition: service_healthy
    entrypoint: ["python3", "extract_and_load.py"]
    profiles:
      - extract

volumes:
  neo4j-data:
```

### Step 4: Generate the Cypher scripts

Create `architecture/neo4j/scripts/load-graph.cypher` with ALL `CREATE` and `MERGE` statements for every node and relationship discovered.

Create `architecture/neo4j/scripts/create-indexes.cypher` with indexes on every node label's primary property.

Create `architecture/neo4j/scripts/useful-queries.cypher` with 20+ pre-built queries covering: overview, module dependencies, data flow, coupling hotspots, impact analysis, complexity indicators, external integrations, dead code detection.

### Step 5: Create launcher script

Save as `architecture/neo4j/start.sh`:

```bash
#!/bin/bash
set -e

echo "============================================"
echo "  REPO ARCHITECTURE - Neo4j Graph Explorer"
echo "============================================"
echo ""

if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed."
    exit 1
fi

echo "Starting Neo4j..."
docker compose up -d neo4j

echo "Waiting for Neo4j to be healthy..."
until docker inspect --format='{{.State.Health.Status}}' repo-architecture-graph 2>/dev/null | grep -q "healthy"; do
    sleep 2
    printf "."
done
echo ""
echo "Neo4j is ready!"

echo "Loading graph data..."
docker compose up graph-loader
docker compose rm -f graph-loader

echo "Starting chat interface on port 8080..."
if command -v python3 &> /dev/null; then
    cd "$(dirname "$0")"
    python3 -m http.server 8080 --bind 0.0.0.0 &
    CHAT_PID=$!
    echo "Chat server PID: $CHAT_PID"
elif command -v npx &> /dev/null; then
    cd "$(dirname "$0")"
    npx -y serve -l 8080 -s . &
else
    echo "NOTE: Install Python3 or npx for the chat server"
    echo "      Or just open chat.html directly in your browser"
fi

echo ""
echo "============================================"
echo "  Everything is running!"
echo ""
echo "  Chat UI:     http://localhost:8080/chat.html"
echo "  Neo4j UI:    http://localhost:7474"
echo "  Bolt URI:    bolt://localhost:7687"
echo "  Username:    neo4j"
echo "  Password:    repoanalysis"
echo ""
echo "  Useful queries: scripts/useful-queries.cypher"
echo ""
echo "  To stop:  docker compose down"
echo "  To reset: docker compose down -v"
echo "============================================"
```

---

## Phase 10 — Chat Interface (Gemini-Powered)

Create a self-contained HTML page (`architecture/neo4j/chat.html`) that lets the user ask questions about the architecture in plain English.

### How it works

1. User types a question like "What functions write to the Order entity?"
2. The page sends the question + the Neo4j schema context to **Gemini API**
3. Gemini generates a Cypher query
4. The page executes the Cypher against Neo4j via the **neo4j-driver** (bolt protocol)
5. Results are displayed in a formatted table

### Requirements

- **Gemini API key:** read from `GEMINI_API_KEY` / entered by the user at runtime (never hardcode)
- **Model:** `gemini-3-flash-preview` (fast, good at Cypher generation)
- **Neo4j driver:** Load from CDN: `https://unpkg.com/neo4j-driver@5.27.0/lib/browser/neo4j-web.min.js`
- **Connection defaults:** `bolt://localhost:7687`, user `neo4j`, password `repoanalysis`

### Features to include

1. **Chat input** at the bottom with send button
2. **Message history** showing questions, generated Cypher, and results
3. **Sidebar with quick queries** (pre-built buttons):
   - "Show all files"
   - "Module dependency map"
   - "Most imported files"
   - "External service usage"
   - "Impact analysis"
   - "Complexity hotspots"
   - "Full graph overview"
4. **Schema context** sent to Gemini with every request (node labels, relationship types, sample properties) so it generates accurate Cypher
5. **Connection settings** panel (bolt URL, username, password, Gemini API key) with save to localStorage
6. **Dark theme** matching the architecture viewer aesthetic
7. **Error handling** for failed queries with the raw Cypher shown so the user can debug

### Schema context template

The chat page must build this context string from the actual graph and send it to Gemini:

```
You are a Cypher query generator for Neo4j. Given a user question about a codebase architecture,
generate ONLY a Cypher query that answers it. Return ONLY the query, no explanation.

The graph has these node labels and their properties:
- File: path, language, loc, type
- Module: name, directory, description
- Function: name, file, params, returnType, async, exported
- Class: name, file, type
- Route: method, path, handler
- Entity: name, table, fields_json
- ExternalService: name, type, purpose
- Package: name, version, dev_only
- Event: name
- Job: name, schedule, handler

Relationships:
IMPORTS, BELONGS_TO, DEFINED_IN, CALLS, HANDLED_BY, USES_MIDDLEWARE,
EXTENDS, IMPLEMENTS, HAS_RELATION, READS_FROM, WRITES_TO, DEPENDS_ON,
CALLS_EXTERNAL, PUBLISHES, SUBSCRIBES_TO, CONNECTS_TO, READS_ENV, EXECUTES
```

---

## Phase 11 — Auto-Extraction Pipeline

Create `architecture/neo4j/extract_and_load.py` - a Python script that can automatically scan any repository and build the Neo4j graph using Google's langextract library + Gemini.

### Dependencies

Save as `architecture/neo4j/requirements.txt`:

```
langextract>=0.3.0
google-generativeai>=0.8.0
neo4j>=5.20.0
```

### How the extractor works

1. **Scan** the repo for source files (skip node_modules, .git, dist, etc.)
2. **Read** each file's contents
3. **Send** to Gemini via langextract for structured extraction:
   - Functions (name, params, return type, exported, async)
   - Classes (name, type, extends, implements)
   - Imports (what files/packages are imported)
   - Routes (method, path, handler)
   - External service calls
   - Event emissions/subscriptions
4. **Generate** Cypher CREATE/MERGE statements from extracted data
5. **Load** into Neo4j via bolt connection
6. **Create** indexes

### Gemini model for extraction

Use `gemini-3-flash-preview` for extraction (better at structured output than flash).

### Fallback

If langextract is not available or fails, fall back to direct Gemini API calls with structured JSON output.

### Dockerfile

Save as `architecture/neo4j/Dockerfile.chat`:

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY extract_and_load.py .
COPY chat.html .
EXPOSE 8080
CMD ["python3", "-m", "http.server", "8080", "--bind", "0.0.0.0"]
```

---

## Phase 12 — Interactive HTML Architecture Viewer

Create `architecture/index.html` - a single-page web app that renders ALL diagrams and the full analysis report.

### Requirements

- **Mermaid.js** loaded from CDN: `https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js`
- **Dark theme** with sidebar navigation
- **All 11 diagrams** rendered inline via Mermaid.js
- **All tables** from the report (identity card, entry/exit points, dependencies, security settings, risks, file inventory)
- **Stats row** at the top (LOC, file count, dependencies, framework version, etc.)
- **Severity badges** on risk items (Low/Medium/High with color coding)
- **Smooth scroll** navigation with active section tracking in sidebar
- **Responsive** - sidebar collapses on small screens
- **No build step** - just open the HTML file in any browser

### Mermaid configuration

```javascript
mermaid.initialize({
    startOnLoad: true,
    theme: 'dark',
    themeVariables: {
        primaryColor: '#1a2332',
        primaryTextColor: '#e2e8f0',
        primaryBorderColor: '#1e3a5f',
        lineColor: '#22d3ee',
        secondaryColor: '#111827',
        tertiaryColor: '#0a0e17'
    },
    flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'basis' },
    sequence: { useMaxWidth: true, wrap: true },
    er: { useMaxWidth: true }
});
```

### Sections to include

1. Stats row (LOC, files, deps, framework, FPS/metrics, license)
2. Repo Identity Card
3. Architecture Overview (2-3 paragraphs)
4. All 11 diagrams, each in a styled container with a label
5. Entry/exit point tables
6. Dependency tables
7. Security settings tables
8. Key architectural decisions (numbered list)
9. Risk areas table with severity badges
10. Recommendations list
11. Neo4j setup instructions
12. Useful Cypher queries (formatted code block)
13. Glossary table
14. File inventory table

---

## Phase 13 — Final Report Assembly

Collect all outputs into `architecture/README.md`. This must contain:

1. **Repo Identity Card** (from Phase 0)
2. **Table of Contents** linking to all diagrams
3. **Architecture Overview** - 2-3 paragraph executive summary
4. **All Mermaid Diagrams** - embedded with ```` ```mermaid ```` blocks (following ALL syntax rules from the top of this document)
5. **Key Architectural Decisions** - patterns observed and why they matter
6. **Risk Areas & Technical Debt** - with severity ratings:
   - Circular dependencies
   - God files/functions (high fan-in or fan-out)
   - Missing error handling
   - Hard-coded configuration
   - Security concerns
   - Missing tests for critical paths
   - Tightly coupled modules
   - Dead code / unused imports
7. **Neo4j Setup Instructions** - how to launch and explore
8. **Useful Neo4j Queries** - embedded from the cheat sheet
9. **Glossary** - domain-specific terms found in the codebase
10. **File Inventory** - every source file with LOC, type, purpose

---

## Phase 14 — Cloud Deployment (Optional)

Create `architecture/neo4j/deploy-digitalocean.sh` for one-command deployment to DigitalOcean:

```bash
#!/bin/bash
set -e

DROPLET_NAME="repo-arch-explorer"
REGION="nyc1"
SIZE="s-2vcpu-4gb"
IMAGE="docker-20-04"

echo "Creating DigitalOcean droplet..."
doctl compute droplet create $DROPLET_NAME \
    --region $REGION \
    --size $SIZE \
    --image $IMAGE \
    --wait

IP=$(doctl compute droplet get $DROPLET_NAME --format PublicIPv4 --no-header)
echo "Droplet IP: $IP"

echo "Uploading files..."
scp -r ../neo4j root@$IP:/opt/architecture/

echo "Starting services..."
ssh root@$IP "cd /opt/architecture && chmod +x start.sh && ./start.sh"

echo ""
echo "============================================"
echo "  Deployed!"
echo "  Chat UI:  http://$IP:8080/chat.html"
echo "  Neo4j UI: http://$IP:7474"
echo "============================================"
```

---

## Execution Rules

1. **Be exhaustive, not superficial.** Read actual source files. Don't guess from filenames alone.
2. **Use real names.** Every diagram must use actual file names, function names, route paths, and entity names from the repo.
3. **When unsure, read the code.** Trace imports and function calls.
4. **Flag what you can't determine.** Note ambiguities explicitly.
5. **Prioritize accuracy over completeness.** 80% correct beats 100% guessed.
6. **Follow ALL Mermaid syntax rules** from the top of this document. No exceptions. Test every diagram mentally before writing it.
7. **For large repos (>500 files):** Focus deep analysis on the primary source directory. Still catalog everything at a high level.
8. **For monorepos:** Treat each package/app as its own analysis unit, then show cross-package dependencies.
9. **Always validate the Neo4j load.** Run `MATCH (n) RETURN labels(n)[0], count(*) ORDER BY count(*) DESC` to verify.
10. **Save all Mermaid files individually** in `architecture/` AND embed them in the README.
11. **Make everything self-contained.** Someone should be able to `cd architecture/neo4j && ./start.sh` and have a working graph + chat in under 60 seconds.
12. **Open the HTML viewer** in the browser when done so the user can see the results immediately.

---

## Quick-Start Checklist

After receiving this prompt, execute in order:

- [ ] **Phase 0:** Recon - identify languages, frameworks, entry points
- [ ] **Phase 1:** Directory map - understand the structure
- [ ] **Phase 2:** Entry/exit points - trace request lifecycle
- [ ] **Phase 3:** Data models - map all entities and relationships
- [ ] **Phase 4:** Service dependencies - map all internal connections
- [ ] **Phase 5:** External deps - catalog all third-party integrations
- [ ] **Phase 6:** Auth/security flow - trace security architecture
- [ ] **Phase 7:** Client architecture - map frontend/renderer (if applicable)
- [ ] **Phase 8:** CI/CD - document build/deploy pipeline
- [ ] **Phase 9:** Neo4j - generate and launch the graph database
- [ ] **Phase 10:** Chat interface - Gemini-powered natural language queries
- [ ] **Phase 11:** Auto-extractor - langextract + Gemini pipeline
- [ ] **Phase 12:** HTML viewer - interactive architecture page
- [ ] **Phase 13:** Final report - assemble README with all diagrams
- [ ] **Phase 14:** Cloud deploy - DigitalOcean script (optional)

**Begin Phase 0 now.**

# Architecture Analyzer Playbook

How to run this full architecture analysis + Neo4j graph + chat interface on any project.

---

## What You Get

After running this on a project, you'll have:

| Output | What It Does |
|--------|-------------|
| `architecture/README.md` | Full written analysis with embedded Mermaid diagrams |
| `architecture/index.html` | Interactive web page with all diagrams rendered (open in browser) |
| `architecture/*.mmd` | 11 standalone Mermaid diagram files |
| `architecture/neo4j/` | Dockerized Neo4j graph database loaded with every dependency, function, file, route, entity, and relationship |
| `architecture/neo4j/chat.html` | Chat interface - ask questions in plain English, Gemini translates to Cypher, queries the graph |
| `architecture/neo4j/extract_and_load.py` | Auto-extraction script - uses langextract + Gemini to scan code and build the graph automatically |

---

## Prerequisites

Install these once. You probably already have most of them.

```bash
# Docker (required for Neo4j)
brew install --cask docker

# Claude Code (you're already using this)
# https://docs.anthropic.com/en/docs/claude-code

# VS Code Mermaid extensions (optional, for .mmd preview)
code --install-extension vstirbu.vscode-mermaid-preview
code --install-extension bierner.markdown-mermaid
```

---

## Step-by-Step: Analyze a New Project

### 1. Open the target project in Claude Code

```bash
cd /path/to/your-project
claude
```

Or open it in VS Code with the Claude Code extension.

### 2. Give Claude the meta-prompt

Copy the entire contents of `meta_understanding.md` and paste it into Claude Code, or say:

```
Read the file /path/to/dynamicbackground/meta_understanding.md and do everything in it for this project.
```

This is the master prompt that triggers all 11 phases of analysis. It tells Claude to:

- **Phase 0**: Scan the repo (languages, frameworks, entry points)
- **Phase 1**: Map the directory structure
- **Phase 2**: Trace every entry/exit point and request lifecycle
- **Phase 3**: Map all data models and relationships
- **Phase 4**: Build the full service dependency graph
- **Phase 5**: Catalog external dependencies and integrations
- **Phase 6**: Trace auth and security flows
- **Phase 7**: Map client/frontend architecture (if applicable)
- **Phase 8**: Document CI/CD and build pipeline
- **Phase 9**: Generate Neo4j Docker setup with Cypher scripts
- **Phase 10**: Assemble the final report

### 3. Ask for the HTML viewer

After the analysis is done, say:

```
Build me an HTML page like architecture/index.html that renders all the diagrams and shows the full report in the browser.
```

### 4. Ask for the chat interface

```
Add langextract + Gemini chat interface so I can talk to the graph.
Use the Gemini API key from my GEMINI_API_KEY environment variable.
```

This creates:
- `chat.html` - browser-based chat UI
- `extract_and_load.py` - auto-extraction pipeline
- `Dockerfile.chat` - containerized version
- Updated `docker-compose.yml` with chat service

### 5. Launch everything

```bash
cd architecture/neo4j
chmod +x start.sh
./start.sh
```

Then open:

| What | URL |
|------|-----|
| **Chat interface** | http://localhost:8080/chat.html |
| **Neo4j browser** | http://localhost:7474 |
| **Architecture viewer** | Just open `architecture/index.html` in your browser |

---

## Talking to the Graph

Once Neo4j is running and the chat interface is open, you can ask things like:

### Finding stuff
- "What files are in the project?"
- "Show me all the functions in auth.controller.ts"
- "What external services does this project use?"
- "List all API routes"

### Understanding dependencies
- "What does UserService depend on?"
- "Which modules import the database module?"
- "Show me the full dependency chain for the orders module"
- "Are there any circular dependencies?"

### Impact analysis
- "If I change user.service.ts, what else is affected?"
- "Which routes touch the Order entity?"
- "What would break if I removed the Redis cache?"

### Finding tech debt
- "Which files have the most lines of code?"
- "Which functions are called by the most other functions?"
- "Are there any files that nothing imports?"
- "Show me functions that write to more than 3 entities"

### Architecture overview
- "How many nodes and relationships are in the graph?"
- "What's the count of each node type?"
- "Show me the module dependency map"

---

## File Reference

Here's what each generated file does and where it lives:

```
your-project/
  architecture/
    README.md                          # Full written report + embedded diagrams
    index.html                         # Interactive web viewer (open in browser)
    01-project-structure.mmd           # Directory hierarchy flowchart
    02-request-lifecycle.mmd           # Entry points + request flow
    03-data-model.mmd                  # ER diagram of all data entities
    04-service-dependencies.mmd        # Module dependency graph
    05-sequence-app-startup.mmd        # Critical flow sequence diagram
    05-sequence-[flow-name].mmd        # More sequence diagrams for key flows
    06-infrastructure.mmd              # Platform, build tools, deployment
    07-auth-flow.mmd                   # Authentication + security model
    08-client-architecture.mmd         # Frontend/renderer architecture
    09-cicd-pipeline.mmd               # Build and deploy pipeline
    neo4j/
      docker-compose.yml               # Neo4j + chat + extractor services
      start.sh                         # One-command launcher
      chat.html                        # Gemini-powered chat interface
      extract_and_load.py              # Auto-extraction script (langextract + Gemini)
      requirements.txt                 # Python deps for extractor
      Dockerfile.chat                  # Container for chat/extractor
      deploy-digitalocean.sh           # Optional: deploy to DigitalOcean
      scripts/
        load-graph.cypher              # All CREATE statements for nodes + relationships
        create-indexes.cypher          # Neo4j indexes for fast queries
        useful-queries.cypher          # 20+ pre-built Cypher queries
      data/                            # Neo4j data volume (auto-created)
      import/                          # Neo4j import directory
```

---

## Using the Auto-Extractor

Instead of manually crafting Cypher, you can run the extractor to automatically scan source code and build the graph:

```bash
# Set your Gemini API key
export GEMINI_API_KEY=your_gemini_api_key

# Run against your repo (Docker)
cd architecture/neo4j
docker compose --profile extract run --rm extractor --repo-path /repo

# Or run directly (Python)
pip install -r requirements.txt
python3 extract_and_load.py --repo-path /path/to/your-project
```

The extractor:
1. Finds all source files in the repo
2. Reads each file and sends it to Gemini for structural extraction
3. Extracts: functions, classes, imports, routes, entities, external calls
4. Generates Cypher statements
5. Loads everything into Neo4j

---

## Deploying to DigitalOcean

If you want the Neo4j + chat interface running on a server:

```bash
cd architecture/neo4j

# Set your DO token
export DIGITALOCEAN_ACCESS_TOKEN=your_token

# Deploy
chmod +x deploy-digitalocean.sh
./deploy-digitalocean.sh
```

This creates a droplet, uploads all files, and starts the Docker services. You'll get a public URL for Neo4j and the chat interface.

---

## Tips

### For large projects (500+ files)
- The extractor handles large repos by processing files in batches
- Claude Code may need multiple passes - ask it to focus on `src/` first, then expand
- The Neo4j graph can handle millions of nodes, so don't worry about size

### For monorepos
- Run the analysis per-package or per-app
- Each gets its own `architecture/` directory
- Cross-package dependencies show up in the module dependency graph

### If diagrams don't render in VS Code
- Use `vstirbu.vscode-mermaid-preview` for `.mmd` files (Cmd+Shift+P > "Preview Mermaid")
- Use `bierner.markdown-mermaid` for diagrams inside `.md` files
- Or just open `architecture/index.html` in your browser - it always works

### If Neo4j won't start
```bash
# Check if ports are already in use
lsof -i :7474
lsof -i :7687

# Reset everything
docker compose down -v
docker compose up -d neo4j
```

### Keeping the graph updated
After making code changes, re-run the extractor:
```bash
docker compose --profile extract run --rm extractor --repo-path /repo
```
Or ask Claude Code to regenerate `load-graph.cypher` and reload:
```bash
cat scripts/load-graph.cypher | docker exec -i repo-architecture-graph cypher-shell -u neo4j -p repoanalysis
```

---

## Quick Reference: Neo4j Credentials

| Field | Value |
|-------|-------|
| **URL** | http://localhost:7474 |
| **Bolt** | bolt://localhost:7687 |
| **Username** | neo4j |
| **Password** | repoanalysis |

## Quick Reference: Gemini API

| Field | Value |
|-------|-------|
| **Key** | set `GEMINI_API_KEY` (never commit it) |
| **Chat model** | gemini-2.0-flash |
| **Extract model** | gemini-2.5-flash |

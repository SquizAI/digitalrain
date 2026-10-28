// ====================================================
// USEFUL QUERIES FOR EXPLORING THE ARCHITECTURE
// Open Neo4j Browser at http://localhost:7474
// Login: neo4j / repoanalysis
// ====================================================

// --- OVERVIEW ---
// Full graph (small repo, safe to display all)
MATCH (n) RETURN n;

// Count of each node type
MATCH (n) RETURN labels(n)[0] AS type, count(*) AS count ORDER BY count DESC;

// Count of each relationship type
MATCH ()-[r]->() RETURN type(r) AS relationship, count(*) AS count ORDER BY count DESC;


// --- MODULE DEPENDENCIES ---
// Which modules depend on which?
MATCH (m1:Module)<-[:BELONGS_TO]-(f1:File)-[:IMPORTS]->(f2:File)-[:BELONGS_TO]->(m2:Module)
WHERE m1 <> m2
RETURN m1.name AS source, m2.name AS target, count(*) AS strength
ORDER BY strength DESC;

// Direct module-to-module dependencies
MATCH (m1:Module)-[r:DEPENDS_ON]->(m2:Module)
RETURN m1.name AS source, m2.name AS target, r.reason;


// --- FUNCTION CALL GRAPH ---
// All function-to-function calls
MATCH (a:Function)-[:CALLS]->(b:Function)
RETURN a.name AS caller, a.file AS caller_file, b.name AS callee, b.file AS callee_file;

// Most called functions (coupling hotspots)
MATCH (f:Function)<-[:CALLS]-(caller:Function)
RETURN f.name, f.file, count(caller) AS call_count
ORDER BY call_count DESC;

// Functions with the most outgoing calls (potential god functions)
MATCH (f:Function)-[:CALLS]->(other:Function)
RETURN f.name, f.file, count(other) AS call_count
ORDER BY call_count DESC;


// --- DATA FLOW ---
// Which functions read/write which entities?
MATCH (f:Function)-[rel:READS_FROM|WRITES_TO]->(e:Entity)
RETURN f.name, f.file, type(rel) AS operation, e.name ORDER BY e.name;


// --- EXTERNAL INTEGRATIONS ---
// What code talks to external services?
MATCH (f:Function)-[:CALLS_EXTERNAL]->(ext:ExternalService)
RETURN ext.name, ext.type, ext.purpose, collect(f.name) AS calling_functions;


// --- EVENT FLOW ---
// Which functions respond to which events?
MATCH (f:Function)-[:SUBSCRIBES_TO]->(e:Event)
RETURN e.name AS event, collect(f.name) AS handlers;


// --- PERIODIC JOBS ---
// All scheduled/periodic tasks
MATCH (j:Job)-[:EXECUTES]->(f:Function)
RETURN j.name, j.schedule, f.name AS handler;


// --- DEPENDENCY ANALYSIS ---
// Most imported files
MATCH (f:File)<-[:IMPORTS]-(importer:File)
RETURN f.path, count(importer) AS import_count
ORDER BY import_count DESC;

// Files by LOC
MATCH (f:File)
RETURN f.path, f.loc ORDER BY f.loc DESC;

// Modules by total LOC
MATCH (f:File)-[:BELONGS_TO]->(m:Module)
RETURN m.name, sum(f.loc) AS total_loc, count(f) AS file_count
ORDER BY total_loc DESC;

// Package usage
MATCH (f:File)-[:DEPENDS_ON]->(p:Package)
RETURN p.name, p.version, p.dev_only, collect(f.path) AS used_by;


// --- FIND IMPACT OF CHANGES ---
// "If I change main.js, what else is affected?"
MATCH (changed:File {path: 'main.js'})
OPTIONAL MATCH (changed)<-[:IMPORTS*1..3]-(affected:File)
RETURN changed.path AS changed_file,
       collect(DISTINCT affected.path) AS affected_files,
       count(DISTINCT affected) AS impact_radius;

// "If I change matrix.js, what else is affected?"
MATCH (changed:File {path: 'matrix.js'})
OPTIONAL MATCH (changed)<-[:IMPORTS*1..3]-(affected:File)
RETURN changed.path AS changed_file,
       collect(DISTINCT affected.path) AS affected_files,
       count(DISTINCT affected) AS impact_radius;


// --- ENVIRONMENT VARIABLES ---
MATCH (e:EnvVar)
OPTIONAL MATCH (f:Function)-[:READS_ENV]->(e)
RETURN e.key, e.required, e.default_value, collect(f.name) AS used_by_functions;

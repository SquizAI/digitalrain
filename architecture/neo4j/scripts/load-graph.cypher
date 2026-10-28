// ==========================================
// REPO ARCHITECTURE GRAPH — Auto-generated
// DigitalRain — Electron Matrix Wallpaper
// ==========================================

// --- MODULES ---
CREATE (:Module {name: 'main-process', directory: '.', description: 'Electron main process — window management, tray, lifecycle'});
CREATE (:Module {name: 'renderer', directory: '.', description: 'Canvas animation engine — Matrix digital rain effect'});
CREATE (:Module {name: 'ui-shell', directory: '.', description: 'HTML/CSS shell for the renderer process'});
CREATE (:Module {name: 'build-config', directory: 'build', description: 'macOS build entitlements and electron-builder config'});
CREATE (:Module {name: 'scripts', directory: '.', description: 'Shell scripts for install, cleanup, and deploy'});

// --- FILES ---
CREATE (:File {path: 'main.js', language: 'javascript', loc: 527, type: 'main-process'});
CREATE (:File {path: 'matrix.js', language: 'javascript', loc: 734, type: 'renderer'});
CREATE (:File {path: 'index.html', language: 'html', loc: 15, type: 'html-shell'});
CREATE (:File {path: 'style.css', language: 'css', loc: 39, type: 'stylesheet'});
CREATE (:File {path: 'package.json', language: 'json', loc: 46, type: 'config'});
CREATE (:File {path: 'build/entitlements.mac.plist', language: 'xml', loc: 20, type: 'config'});
CREATE (:File {path: 'install.sh', language: 'bash', loc: 45, type: 'script'});
CREATE (:File {path: 'cleanup.sh', language: 'bash', loc: 128, type: 'script'});
CREATE (:File {path: 'github_deploy.sh', language: 'bash', loc: 104, type: 'script'});
CREATE (:File {path: '.gitignore', language: 'text', loc: 35, type: 'config'});
CREATE (:File {path: 'README.md', language: 'markdown', loc: 108, type: 'docs'});
CREATE (:File {path: 'LICENSE', language: 'text', loc: 21, type: 'docs'});

// --- FUNCTIONS (main.js) ---
CREATE (:Function {name: 'setupAutoLaunch', file: 'main.js', async: false, exported: false, description: 'Configure app to launch at macOS login'});
CREATE (:Function {name: 'createProcessFinderScript', file: 'main.js', async: false, exported: false, description: 'Build AppleScript to find Electron process by name'});
CREATE (:Function {name: 'createMatrixWindow', file: 'main.js', async: false, exported: false, description: 'Create BrowserWindow for a single display'});
CREATE (:Function {name: 'fixMacOSWindowVisibility', file: 'main.js', async: false, exported: false, description: 'Force window visibility via Electron + AppleScript'});
CREATE (:Function {name: 'createTray', file: 'main.js', async: false, exported: false, description: 'Create system tray icon and context menu'});
CREATE (:Function {name: 'toggleWallpaperVisibility', file: 'main.js', async: false, exported: false, description: 'Show/hide all background windows'});
CREATE (:Function {name: 'showAboutDialog', file: 'main.js', async: false, exported: false, description: 'Display about dialog with app info'});
CREATE (:Function {name: 'verifyWindowPositions', file: 'main.js', async: false, exported: false, description: 'Check window bounds match display bounds'});
CREATE (:Function {name: 'setupPositionChecker', file: 'main.js', async: false, exported: false, description: 'Start 5-minute interval to verify window positions'});
CREATE (:Function {name: 'recreateMatrixWindows', file: 'main.js', async: false, exported: false, description: 'Close all windows and recreate for current displays'});
CREATE (:Function {name: 'handleDisplayChange', file: 'main.js', async: false, exported: false, description: 'Debounced handler for display add/remove/change events'});
CREATE (:Function {name: 'setupVisibilityChecker', file: 'main.js', async: false, exported: false, description: 'Start 60-second interval to detect hidden windows'});

// --- FUNCTIONS (matrix.js) ---
CREATE (:Function {name: 'resizeCanvas', file: 'matrix.js', async: false, exported: true, description: 'Set canvas dimensions with DPR scaling'});
CREATE (:Function {name: 'rgba', file: 'matrix.js', async: false, exported: false, description: 'Cached RGBA color string builder'});
CREATE (:Function {name: 'logError', file: 'matrix.js', async: false, exported: false, description: 'Throttled error logger (max 1/sec)'});
CREATE (:Function {name: 'createErrorDisplay', file: 'matrix.js', async: false, exported: false, description: 'Create on-screen error log DOM element'});
CREATE (:Function {name: 'getMatrixChar', file: 'matrix.js', async: false, exported: false, description: 'Return random Katakana character'});
CREATE (:Function {name: 'createDrop', file: 'matrix.js', async: false, exported: false, description: 'Factory function: create a new rain drop object'});
CREATE (:Function {name: 'initializeDrops', file: 'matrix.js', async: false, exported: false, description: 'Populate drops array based on density config'});
CREATE (:Function {name: 'getEncryptedChar', file: 'matrix.js', async: false, exported: false, description: 'Get or cache encrypted char for a drop position'});
CREATE (:Function {name: 'refreshEncryptedChar', file: 'matrix.js', async: false, exported: false, description: 'Randomly replace encrypted char (8% chance)'});
CREATE (:Function {name: 'setFont', file: 'matrix.js', async: false, exported: false, description: 'Set canvas font with caching to skip redundant assignments'});
CREATE (:Function {name: 'draw', file: 'matrix.js', async: false, exported: false, description: 'Main animation loop: clear, process drops, render, schedule next'});
CREATE (:Function {name: 'initialize', file: 'matrix.js', async: false, exported: false, description: 'Entry point: setup canvas, drops, start animation'});

// --- ENTITIES (data structures, not database tables) ---
CREATE (:Entity {name: 'CONFIG', table: 'in-memory', fields_json: '{"SHOW_WORDS":"boolean","SHOW_TRAILS":"boolean","DROP_DENSITY":"float","MAX_DROPS":"int","MIN_TRAIL_LENGTH":"int","MAX_TRAIL_LENGTH":"int","TARGET_FPS":"int","SPEED_MULTIPLIER":"float","MIN_FONT_SIZE":"int","MAX_FONT_SIZE":"int","TYPING_SPEED":"int","WORD_PAUSE":"int","TYPING_DIRECTION":"string","CRISP_TEXT":"boolean"}'});
CREATE (:Entity {name: 'Drop', table: 'in-memory', fields_json: '{"id":"string","x":"float","y":"float","speed":"float","text":"string","fontSize":"int","visibleChars":"int","trail":"array","trailLength":"int","typingTimer":"float","typingState":"string","pauseTimer":"float","lastTypingTime":"float","baseColor":"object","pulsePhase":"float","pulseSpeed":"float","showTrail":"boolean","trailStartTime":"float","encryptedChars":"Map"}'});
CREATE (:Entity {name: 'BrowserWindowConfig', table: 'in-memory', fields_json: '{"x":"int","y":"int","width":"int","height":"int","frame":"boolean","show":"boolean","skipTaskbar":"boolean","transparent":"boolean","backgroundColor":"string","hasShadow":"boolean","roundedCorners":"boolean","nodeIntegration":"boolean","contextIsolation":"boolean"}'});

// --- PACKAGES (dependencies) ---
CREATE (:Package {name: 'electron', version: '^28.0.0', dev_only: true});
CREATE (:Package {name: 'electron-builder', version: '^24.9.1', dev_only: true});
CREATE (:Package {name: 'canvas', version: '^3.1.0', dev_only: true});

// --- EXTERNAL SERVICES ---
CREATE (:ExternalService {name: 'macOS Display API', type: 'platform', purpose: 'Multi-monitor detection and bounds'});
CREATE (:ExternalService {name: 'macOS System Tray', type: 'platform', purpose: 'Menu bar icon and context menu'});
CREATE (:ExternalService {name: 'macOS AppleScript', type: 'platform', purpose: 'Window visibility fix fallback via osascript'});
CREATE (:ExternalService {name: 'macOS Login Items', type: 'platform', purpose: 'Auto-launch at system boot'});
CREATE (:ExternalService {name: 'GitHub Releases', type: 'deployment', purpose: 'Distribution via github_deploy.sh'});

// --- ENV VARS ---
CREATE (:EnvVar {key: 'DEBUG_MODE', required: false, default_value: 'undefined', used_by: 'main.js'});

// --- EVENTS ---
CREATE (:Event {name: 'app:whenReady', payload_schema: 'void'});
CREATE (:Event {name: 'app:before-quit', payload_schema: 'void'});
CREATE (:Event {name: 'app:activate', payload_schema: 'void'});
CREATE (:Event {name: 'app:window-all-closed', payload_schema: 'void'});
CREATE (:Event {name: 'app:gpu-process-crashed', payload_schema: '{killed: boolean}'});
CREATE (:Event {name: 'screen:display-added', payload_schema: '{display: Display}'});
CREATE (:Event {name: 'screen:display-removed', payload_schema: '{display: Display}'});
CREATE (:Event {name: 'screen:display-metrics-changed', payload_schema: '{display: Display}'});
CREATE (:Event {name: 'win:ready-to-show', payload_schema: 'void'});
CREATE (:Event {name: 'win:closed', payload_schema: 'void'});
CREATE (:Event {name: 'webContents:crashed', payload_schema: 'void'});
CREATE (:Event {name: 'globalShortcut:Cmd+Option+M', payload_schema: 'void'});
CREATE (:Event {name: 'DOMContentLoaded', payload_schema: 'void'});
CREATE (:Event {name: 'window:resize', payload_schema: 'void'});
CREATE (:Event {name: 'canvas:click', payload_schema: 'void'});
CREATE (:Event {name: 'window:beforeunload', payload_schema: 'void'});

// --- JOBS (periodic tasks) ---
CREATE (:Job {name: 'positionChecker', schedule: 'every 300000ms (5 min)', handler: 'verifyWindowPositions'});
CREATE (:Job {name: 'visibilityChecker', schedule: 'every 60000ms (1 min)', handler: 'setupVisibilityChecker'});
CREATE (:Job {name: 'displayChangeDebounce', schedule: '30000ms debounce', handler: 'handleDisplayChange'});

// ==========================================
// RELATIONSHIPS
// ==========================================

// --- FILE → MODULE ---
MATCH (f:File {path: 'main.js'}), (m:Module {name: 'main-process'}) CREATE (f)-[:BELONGS_TO]->(m);
MATCH (f:File {path: 'matrix.js'}), (m:Module {name: 'renderer'}) CREATE (f)-[:BELONGS_TO]->(m);
MATCH (f:File {path: 'index.html'}), (m:Module {name: 'ui-shell'}) CREATE (f)-[:BELONGS_TO]->(m);
MATCH (f:File {path: 'style.css'}), (m:Module {name: 'ui-shell'}) CREATE (f)-[:BELONGS_TO]->(m);
MATCH (f:File {path: 'package.json'}), (m:Module {name: 'build-config'}) CREATE (f)-[:BELONGS_TO]->(m);
MATCH (f:File {path: 'build/entitlements.mac.plist'}), (m:Module {name: 'build-config'}) CREATE (f)-[:BELONGS_TO]->(m);
MATCH (f:File {path: 'install.sh'}), (m:Module {name: 'scripts'}) CREATE (f)-[:BELONGS_TO]->(m);
MATCH (f:File {path: 'cleanup.sh'}), (m:Module {name: 'scripts'}) CREATE (f)-[:BELONGS_TO]->(m);
MATCH (f:File {path: 'github_deploy.sh'}), (m:Module {name: 'scripts'}) CREATE (f)-[:BELONGS_TO]->(m);

// --- FILE → FILE IMPORTS ---
MATCH (a:File {path: 'main.js'}), (b:File {path: 'index.html'}) CREATE (a)-[:IMPORTS {type: 'loadFile'}]->(b);
MATCH (a:File {path: 'index.html'}), (b:File {path: 'style.css'}) CREATE (a)-[:IMPORTS {type: 'link'}]->(b);
MATCH (a:File {path: 'index.html'}), (b:File {path: 'matrix.js'}) CREATE (a)-[:IMPORTS {type: 'script'}]->(b);

// --- FUNCTION → FILE (DEFINED_IN) ---
MATCH (f:Function {name: 'setupAutoLaunch'}), (file:File {path: 'main.js'}) CREATE (f)-[:DEFINED_IN]->(file);
MATCH (f:Function {name: 'createProcessFinderScript'}), (file:File {path: 'main.js'}) CREATE (f)-[:DEFINED_IN]->(file);
MATCH (f:Function {name: 'createMatrixWindow'}), (file:File {path: 'main.js'}) CREATE (f)-[:DEFINED_IN]->(file);
MATCH (f:Function {name: 'fixMacOSWindowVisibility'}), (file:File {path: 'main.js'}) CREATE (f)-[:DEFINED_IN]->(file);
MATCH (f:Function {name: 'createTray'}), (file:File {path: 'main.js'}) CREATE (f)-[:DEFINED_IN]->(file);
MATCH (f:Function {name: 'toggleWallpaperVisibility'}), (file:File {path: 'main.js'}) CREATE (f)-[:DEFINED_IN]->(file);
MATCH (f:Function {name: 'showAboutDialog'}), (file:File {path: 'main.js'}) CREATE (f)-[:DEFINED_IN]->(file);
MATCH (f:Function {name: 'verifyWindowPositions'}), (file:File {path: 'main.js'}) CREATE (f)-[:DEFINED_IN]->(file);
MATCH (f:Function {name: 'setupPositionChecker'}), (file:File {path: 'main.js'}) CREATE (f)-[:DEFINED_IN]->(file);
MATCH (f:Function {name: 'recreateMatrixWindows'}), (file:File {path: 'main.js'}) CREATE (f)-[:DEFINED_IN]->(file);
MATCH (f:Function {name: 'handleDisplayChange'}), (file:File {path: 'main.js'}) CREATE (f)-[:DEFINED_IN]->(file);
MATCH (f:Function {name: 'setupVisibilityChecker'}), (file:File {path: 'main.js'}) CREATE (f)-[:DEFINED_IN]->(file);
MATCH (f:Function {name: 'resizeCanvas'}), (file:File {path: 'matrix.js'}) CREATE (f)-[:DEFINED_IN]->(file);
MATCH (f:Function {name: 'rgba'}), (file:File {path: 'matrix.js'}) CREATE (f)-[:DEFINED_IN]->(file);
MATCH (f:Function {name: 'logError'}), (file:File {path: 'matrix.js'}) CREATE (f)-[:DEFINED_IN]->(file);
MATCH (f:Function {name: 'createErrorDisplay'}), (file:File {path: 'matrix.js'}) CREATE (f)-[:DEFINED_IN]->(file);
MATCH (f:Function {name: 'getMatrixChar'}), (file:File {path: 'matrix.js'}) CREATE (f)-[:DEFINED_IN]->(file);
MATCH (f:Function {name: 'createDrop'}), (file:File {path: 'matrix.js'}) CREATE (f)-[:DEFINED_IN]->(file);
MATCH (f:Function {name: 'initializeDrops'}), (file:File {path: 'matrix.js'}) CREATE (f)-[:DEFINED_IN]->(file);
MATCH (f:Function {name: 'getEncryptedChar'}), (file:File {path: 'matrix.js'}) CREATE (f)-[:DEFINED_IN]->(file);
MATCH (f:Function {name: 'refreshEncryptedChar'}), (file:File {path: 'matrix.js'}) CREATE (f)-[:DEFINED_IN]->(file);
MATCH (f:Function {name: 'setFont'}), (file:File {path: 'matrix.js'}) CREATE (f)-[:DEFINED_IN]->(file);
MATCH (f:Function {name: 'draw'}), (file:File {path: 'matrix.js'}) CREATE (f)-[:DEFINED_IN]->(file);
MATCH (f:Function {name: 'initialize'}), (file:File {path: 'matrix.js'}) CREATE (f)-[:DEFINED_IN]->(file);

// --- FUNCTION CALLS ---
// main.js internal calls
MATCH (a:Function {name: 'recreateMatrixWindows'}), (b:Function {name: 'createMatrixWindow'}) CREATE (a)-[:CALLS]->(b);
MATCH (a:Function {name: 'createTray'}), (b:Function {name: 'toggleWallpaperVisibility'}) CREATE (a)-[:CALLS]->(b);
MATCH (a:Function {name: 'createTray'}), (b:Function {name: 'recreateMatrixWindows'}) CREATE (a)-[:CALLS]->(b);
MATCH (a:Function {name: 'createTray'}), (b:Function {name: 'fixMacOSWindowVisibility'}) CREATE (a)-[:CALLS]->(b);
MATCH (a:Function {name: 'createTray'}), (b:Function {name: 'showAboutDialog'}) CREATE (a)-[:CALLS]->(b);
MATCH (a:Function {name: 'fixMacOSWindowVisibility'}), (b:Function {name: 'createProcessFinderScript'}) CREATE (a)-[:CALLS]->(b);
MATCH (a:Function {name: 'handleDisplayChange'}), (b:Function {name: 'recreateMatrixWindows'}) CREATE (a)-[:CALLS]->(b);
MATCH (a:Function {name: 'verifyWindowPositions'}), (b:Function {name: 'recreateMatrixWindows'}) CREATE (a)-[:CALLS]->(b);
MATCH (a:Function {name: 'setupPositionChecker'}), (b:Function {name: 'verifyWindowPositions'}) CREATE (a)-[:CALLS]->(b);

// matrix.js internal calls
MATCH (a:Function {name: 'initialize'}), (b:Function {name: 'resizeCanvas'}) CREATE (a)-[:CALLS]->(b);
MATCH (a:Function {name: 'initialize'}), (b:Function {name: 'initializeDrops'}) CREATE (a)-[:CALLS]->(b);
MATCH (a:Function {name: 'initialize'}), (b:Function {name: 'draw'}) CREATE (a)-[:CALLS]->(b);
MATCH (a:Function {name: 'initializeDrops'}), (b:Function {name: 'createDrop'}) CREATE (a)-[:CALLS]->(b);
MATCH (a:Function {name: 'createDrop'}), (b:Function {name: 'getMatrixChar'}) CREATE (a)-[:CALLS]->(b);
MATCH (a:Function {name: 'draw'}), (b:Function {name: 'initializeDrops'}) CREATE (a)-[:CALLS]->(b);
MATCH (a:Function {name: 'draw'}), (b:Function {name: 'setFont'}) CREATE (a)-[:CALLS]->(b);
MATCH (a:Function {name: 'draw'}), (b:Function {name: 'rgba'}) CREATE (a)-[:CALLS]->(b);
MATCH (a:Function {name: 'draw'}), (b:Function {name: 'getEncryptedChar'}) CREATE (a)-[:CALLS]->(b);
MATCH (a:Function {name: 'draw'}), (b:Function {name: 'refreshEncryptedChar'}) CREATE (a)-[:CALLS]->(b);
MATCH (a:Function {name: 'draw'}), (b:Function {name: 'getMatrixChar'}) CREATE (a)-[:CALLS]->(b);
MATCH (a:Function {name: 'draw'}), (b:Function {name: 'logError'}) CREATE (a)-[:CALLS]->(b);
MATCH (a:Function {name: 'logError'}), (b:Function {name: 'createErrorDisplay'}) CREATE (a)-[:CALLS]->(b);

// --- FUNCTION → ENTITY (READS_FROM / WRITES_TO) ---
MATCH (f:Function {name: 'draw'}), (e:Entity {name: 'Drop'}) CREATE (f)-[:READS_FROM]->(e);
MATCH (f:Function {name: 'draw'}), (e:Entity {name: 'Drop'}) CREATE (f)-[:WRITES_TO]->(e);
MATCH (f:Function {name: 'draw'}), (e:Entity {name: 'CONFIG'}) CREATE (f)-[:READS_FROM]->(e);
MATCH (f:Function {name: 'createDrop'}), (e:Entity {name: 'Drop'}) CREATE (f)-[:WRITES_TO]->(e);
MATCH (f:Function {name: 'createDrop'}), (e:Entity {name: 'CONFIG'}) CREATE (f)-[:READS_FROM]->(e);
MATCH (f:Function {name: 'initializeDrops'}), (e:Entity {name: 'CONFIG'}) CREATE (f)-[:READS_FROM]->(e);
MATCH (f:Function {name: 'createMatrixWindow'}), (e:Entity {name: 'BrowserWindowConfig'}) CREATE (f)-[:WRITES_TO]->(e);

// --- FUNCTION → EXTERNAL SERVICE ---
MATCH (f:Function {name: 'fixMacOSWindowVisibility'}), (e:ExternalService {name: 'macOS AppleScript'}) CREATE (f)-[:CALLS_EXTERNAL]->(e);
MATCH (f:Function {name: 'setupAutoLaunch'}), (e:ExternalService {name: 'macOS Login Items'}) CREATE (f)-[:CALLS_EXTERNAL]->(e);
MATCH (f:Function {name: 'recreateMatrixWindows'}), (e:ExternalService {name: 'macOS Display API'}) CREATE (f)-[:CALLS_EXTERNAL]->(e);
MATCH (f:Function {name: 'createTray'}), (e:ExternalService {name: 'macOS System Tray'}) CREATE (f)-[:CALLS_EXTERNAL]->(e);

// --- FILE → PACKAGE ---
MATCH (f:File {path: 'main.js'}), (p:Package {name: 'electron'}) CREATE (f)-[:DEPENDS_ON]->(p);
MATCH (f:File {path: 'package.json'}), (p:Package {name: 'electron'}) CREATE (f)-[:DEPENDS_ON]->(p);
MATCH (f:File {path: 'package.json'}), (p:Package {name: 'electron-builder'}) CREATE (f)-[:DEPENDS_ON]->(p);
MATCH (f:File {path: 'package.json'}), (p:Package {name: 'canvas'}) CREATE (f)-[:DEPENDS_ON]->(p);

// --- MODULE → MODULE ---
MATCH (a:Module {name: 'main-process'}), (b:Module {name: 'ui-shell'}) CREATE (a)-[:DEPENDS_ON {reason: 'loadFile index.html'}]->(b);
MATCH (a:Module {name: 'ui-shell'}), (b:Module {name: 'renderer'}) CREATE (a)-[:DEPENDS_ON {reason: 'script tag loads matrix.js'}]->(b);
MATCH (a:Module {name: 'main-process'}), (b:Module {name: 'build-config'}) CREATE (a)-[:DEPENDS_ON {reason: 'entitlements for mac build'}]->(b);
MATCH (a:Module {name: 'scripts'}), (b:Module {name: 'build-config'}) CREATE (a)-[:DEPENDS_ON {reason: 'install/deploy use npm build'}]->(b);

// --- FUNCTION → EVENT (SUBSCRIBES_TO / PUBLISHES) ---
MATCH (f:Function {name: 'recreateMatrixWindows'}), (e:Event {name: 'app:whenReady'}) CREATE (f)-[:SUBSCRIBES_TO]->(e);
MATCH (f:Function {name: 'setupAutoLaunch'}), (e:Event {name: 'app:whenReady'}) CREATE (f)-[:SUBSCRIBES_TO]->(e);
MATCH (f:Function {name: 'createTray'}), (e:Event {name: 'app:whenReady'}) CREATE (f)-[:SUBSCRIBES_TO]->(e);
MATCH (f:Function {name: 'handleDisplayChange'}), (e:Event {name: 'screen:display-added'}) CREATE (f)-[:SUBSCRIBES_TO]->(e);
MATCH (f:Function {name: 'handleDisplayChange'}), (e:Event {name: 'screen:display-removed'}) CREATE (f)-[:SUBSCRIBES_TO]->(e);
MATCH (f:Function {name: 'handleDisplayChange'}), (e:Event {name: 'screen:display-metrics-changed'}) CREATE (f)-[:SUBSCRIBES_TO]->(e);
MATCH (f:Function {name: 'toggleWallpaperVisibility'}), (e:Event {name: 'globalShortcut:Cmd+Option+M'}) CREATE (f)-[:SUBSCRIBES_TO]->(e);
MATCH (f:Function {name: 'toggleWallpaperVisibility'}), (e:Event {name: 'app:activate'}) CREATE (f)-[:SUBSCRIBES_TO]->(e);
MATCH (f:Function {name: 'initialize'}), (e:Event {name: 'DOMContentLoaded'}) CREATE (f)-[:SUBSCRIBES_TO]->(e);

// --- JOB → FUNCTION ---
MATCH (j:Job {name: 'positionChecker'}), (f:Function {name: 'verifyWindowPositions'}) CREATE (j)-[:EXECUTES]->(f);
MATCH (j:Job {name: 'visibilityChecker'}), (f:Function {name: 'setupVisibilityChecker'}) CREATE (j)-[:EXECUTES]->(f);
MATCH (j:Job {name: 'displayChangeDebounce'}), (f:Function {name: 'handleDisplayChange'}) CREATE (j)-[:EXECUTES]->(f);

// --- FUNCTION → ENV_VAR ---
MATCH (f:Function {name: 'setupAutoLaunch'}), (e:EnvVar {key: 'DEBUG_MODE'}) CREATE (f)-[:READS_ENV]->(e);

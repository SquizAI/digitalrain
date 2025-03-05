const { app, BrowserWindow, Tray, Menu, screen, globalShortcut, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

// Disable hardware acceleration to prevent GPU crashes
app.disableHardwareAcceleration();

// Global variables
let tray = null;
let backgroundWindows = [];
let isQuitting = false;
let isRefreshing = false;
let displayChangeTimeout = null;
const isDebugMode = process.env.DEBUG_MODE === 'true';

// Log startup information
console.log(`Starting DigitalRain (Debug Mode: ${isDebugMode})`);
console.log(`Platform: ${process.platform}, Electron: ${process.versions.electron}`);

// Auto launch at startup
const setupAutoLaunch = () => {
  try {
    // Use more robust auto-launch method
    app.setLoginItemSettings({
      openAtLogin: true,
      openAsHidden: true,
      name: 'DigitalRain',
      path: app.getPath('exe')
    });
    
    // Also set the preference in app configuration
    app.setName('DigitalRain');
    
    console.log("Auto-launch configured successfully");
  } catch (error) {
    console.error('Error setting up auto-launch:', error);
  }
};

// Helper function to create AppleScript that tries multiple process names
function createProcessFinderScript(action) {
  // List of possible process names to try
  const processNames = ['Electron', 'electron', app.getName(), 'DigitalRain', 'digital-rain'];
  
  // Create a script that tries each process name
  let scriptParts = ['tell application "System Events"'];
  
  // Add a try block for each process name
  processNames.forEach((name, index) => {
    if (index === 0) {
      scriptParts.push(`  try`);
    } else {
      scriptParts.push(`  on error`);
      scriptParts.push(`    try`);
    }
    
    scriptParts.push(`      set appProcess to first process whose name is "${name}"`);
    scriptParts.push(`      ${action}`);
    
    if (index === processNames.length - 1) {
      scriptParts.push(`    end try`);
    }
  });
  
  // Close all the try blocks
  for (let i = 0; i < processNames.length - 1; i++) {
    scriptParts.push(`  end try`);
  }
  
  scriptParts.push(`end tell`);
  
  return scriptParts.join('\n');
}

// Create a single window for the matrix animation
function createMatrixWindow(display) {
  console.log(`Creating window for display: ${display.bounds.width}x${display.bounds.height}`);
  
  // Create window with dimensions to match the display
  const { x, y, width, height } = display.bounds;
  
  // Create the window
  let win = new BrowserWindow({
    x, 
    y,
    width,
    height,
    frame: false,
    show: false,
    skipTaskbar: true,
    transparent: true,
    hasShadow: false,
    roundedCorners: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Load the content
  win.loadFile('index.html');

  // Set macOS-specific settings to achieve wallpaper effect
  if (process.platform === 'darwin') {
    // Set as visible on all workspaces
    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    
    // Set window level to be just above the desktop wallpaper
    // Use desktop-1 level which is right above the desktop wallpaper
    win.setAlwaysOnTop(true, 'desktop', -1);
    
    // Allow clicks to pass through to apps underneath
    win.setIgnoreMouseEvents(true);
  } else {
    // Windows/Linux settings
    win.setSkipTaskbar(true);
    win.setIgnoreMouseEvents(true);
  }
  
  // Show window once it's ready
  win.once('ready-to-show', () => {
    win.show();
  });

  // Handle window close events and renderer crashes
  win.on('closed', () => {
    // Remove reference to the window
    const index = backgroundWindows.indexOf(win);
    if (index > -1) {
      backgroundWindows.splice(index, 1);
    }
    win = null;
  });
  
  // Handle renderer process crashes
  win.webContents.on('crashed', () => {
    console.error('Renderer process crashed, recreating window');
    
    // Remove reference to the window
    const index = backgroundWindows.indexOf(win);
    if (index > -1) {
      backgroundWindows.splice(index, 1);
    }
    
    // Create a new window for this display
    setTimeout(() => {
      if (!isQuitting) {
        const newWin = createMatrixWindow(display);
        backgroundWindows.push(newWin);
      }
    }, 1000);
  });

  return win;
}

// Function to manually check and fix window visibility on macOS
function fixMacOSWindowVisibility() {
  if (process.platform !== 'darwin' || backgroundWindows.length === 0) {
    return;
  }
  
  console.log("Attempting to fix macOS window visibility...");
  
  // First try standard Electron methods
  backgroundWindows.forEach(win => {
    if (!win.isDestroyed()) {
      // Force visibility settings
      win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
      win.show();
      
      // Ensure window level is set correctly - use desktop-icon instead of desktop
      win.setAlwaysOnTop(true, 'desktop-icon', -1);
    }
  });
  
  // Then use AppleScript as a fallback for more stubborn cases
  try {
    // Use a higher window level to ensure it covers the wallpaper
    const script = createProcessFinderScript('set visible of appProcess to true\n      set windowLevel of every window of appProcess to -2147483621');
    
    exec(`osascript -e '${script}'`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error running AppleScript for visibility fix:', error);
      } else {
        console.log('AppleScript visibility fix succeeded');
      }
    });
    
    // Additional script to bring windows to front
    const bringToFrontScript = createProcessFinderScript('set index of every window of appProcess to 1');
    
    exec(`osascript -e '${bringToFrontScript}'`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error running AppleScript to bring windows to front:', error);
      } else {
        console.log('AppleScript bring to front succeeded');
      }
    });
  } catch (error) {
    console.error('Error attempting visibility fix with AppleScript:', error);
  }
}

// Create tray icon
function createTray() {
  try {
    const iconPath = path.join(__dirname, 'icon.png');
    console.log(`Loading tray icon from: ${iconPath}`);
    
    if (!fs.existsSync(iconPath)) {
      console.error('Tray icon not found at:', iconPath);
      return;
    }
    
    tray = new Tray(iconPath);
    tray.setToolTip('DigitalRain');
    
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Toggle Visibility',
        click: toggleWallpaperVisibility
      },
      { type: 'separator' },
      {
        label: 'Refresh Wallpaper',
        click: () => {
          recreateMatrixWindows();
        }
      },
      // Add macOS-specific menu item for visibility fixes
      ...(process.platform === 'darwin' ? [{
        label: 'Fix macOS Visibility',
        click: fixMacOSWindowVisibility
      }] : []),
      {
        label: 'Debug Mode',
        type: 'checkbox',
        checked: isDebugMode,
        click: () => {
          dialog.showMessageBox({
            type: 'info',
            title: 'Debug Mode',
            message: 'To toggle debug mode, restart the app with:',
            detail: './run-debug.sh\n\nor\n\n./run.sh',
            buttons: ['OK']
          });
        }
      },
      { type: 'separator' },
      {
        label: 'About',
        click: showAboutDialog
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          isQuitting = true;
          app.quit();
        }
      }
    ]);
    
    tray.setContextMenu(contextMenu);
    console.log("Tray icon created successfully");
  } catch (error) {
    console.error('Error creating tray:', error);
  }
}

// Function to toggle wallpaper visibility
function toggleWallpaperVisibility() {
  if (backgroundWindows.length === 0) {
    createMatrixWindow();
    return;
  }
  
  const isVisible = backgroundWindows[0].isVisible();
  
  backgroundWindows.forEach(win => {
    if (isVisible) {
      win.hide();
    } else {
      win.show();
    }
  });
}

// Show about dialog
function showAboutDialog() {
  dialog.showMessageBox({
    title: 'About DigitalRain',
    message: 'DigitalRain',
    detail: 'A Matrix-inspired animated wallpaper.\n\nVersion 1.0.0\n\nCreated by Matty Squarzoni',
    buttons: ['OK'],
    icon: path.join(__dirname, 'icon.png')
  });
}

// Verify and fix window positions if they don't match display bounds
function verifyWindowPositions() {
  const displays = screen.getAllDisplays();
  
  // Check if we have the correct number of windows
  if (backgroundWindows.length !== displays.length) {
    console.log(`Window count mismatch: ${backgroundWindows.length} windows for ${displays.length} displays`);
    recreateMatrixWindows();
    return;
  }
  
  let needsFix = false;
  
  // Check each window position
  displays.forEach((display, index) => {
    if (index >= backgroundWindows.length) {
      needsFix = true;
      return;
    }
    
    const win = backgroundWindows[index];
    if (win.isDestroyed()) {
      needsFix = true;
      return;
    }
    
    const bounds = win.getBounds();
    const displayBounds = display.bounds;
    
    // Check if window bounds match display bounds
    if (bounds.x !== displayBounds.x || 
        bounds.y !== displayBounds.y || 
        bounds.width !== displayBounds.width || 
        bounds.height !== displayBounds.height) {
      console.log(`Window ${index} has incorrect bounds: ${JSON.stringify(bounds)} vs ${JSON.stringify(displayBounds)}`);
      needsFix = true;
    }
  });
  
  // If any issues were found, recreate all windows
  if (needsFix) {
    console.log("Window position issues detected, recreating all windows");
    recreateMatrixWindows();
  } else {
    console.log("All window positions verified correctly");
  }
}

// Setup a periodic window position check
function setupPositionChecker() {
  // Check positions every 5 minutes
  setInterval(() => {
    if (!isRefreshing && !isQuitting) {
      verifyWindowPositions();
    }
  }, 300000); // 5 minutes
}

// Set up the app
app.whenReady().then(() => {
  // Remove the duplicate call to app.disableHardwareAcceleration()
  // as it's already called at the beginning of the file
  
  // Set up auto-launch if needed
  setupAutoLaunch();
  
  // Create the tray
  createTray();
  
  // Give the app a moment to initialize before creating windows
  setTimeout(() => {
    // Create wallpaper windows for all displays
    recreateMatrixWindows();
    
    // Register keyboard shortcut to toggle wallpaper visibility
    globalShortcut.register('CommandOrControl+Option+M', toggleWallpaperVisibility);
    
    // Listen for display changes
    screen.on('display-added', handleDisplayChange);
    screen.on('display-removed', handleDisplayChange);
    screen.on('display-metrics-changed', handleDisplayChange);
    
    // Set up periodic visibility checker for macOS
    setupVisibilityChecker();
    
    // Set up periodic position checker
    setupPositionChecker();
    
    console.log('Application initialized successfully');
  }, 1000);
});

// Handle app quit
app.on('before-quit', () => {
  isQuitting = true;
  
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
});

// Handle GPU process crashes
app.on('gpu-process-crashed', (event, killed) => {
  console.error(`GPU process crashed (killed: ${killed}). Attempting to recover...`);
  // Don't try to recreate windows immediately, just log the error
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

// Create a windows for each display
function recreateMatrixWindows() {
  console.log("Recreating matrix windows...");
  
  // Close any existing windows
  if (backgroundWindows.length > 0) {
    backgroundWindows.forEach(win => {
      if (!win.isDestroyed()) {
        try {
          win.close();
        } catch (error) {
          console.error('Error closing window:', error);
        }
      }
    });
    backgroundWindows = [];
  }
  
  // Get all displays
  const displays = screen.getAllDisplays();
  console.log(`Found ${displays.length} displays`);
  
  // Create a window for each display
  displays.forEach((display, i) => {
    console.log(`Creating window for display ${i+1}: ${display.bounds.width}x${display.bounds.height}`);
    
    try {
      const win = createMatrixWindow(display);
      // Store reference to window
      backgroundWindows.push(win);
    } catch (error) {
      console.error(`Error creating window for display ${i+1}:`, error);
    }
  });
}

// Handle display changes with debounce
function handleDisplayChange() {
  console.log("Display change detected");
  
  // Clear any existing timeout
  if (displayChangeTimeout) {
    clearTimeout(displayChangeTimeout);
    displayChangeTimeout = null;
    return; // Exit early if we're already handling a display change
  }
  
  // Don't recreate if already refreshing
  if (isRefreshing) {
    console.log("Already refreshing, ignoring display change");
    return;
  }
  
  // Set a much longer timeout to avoid constant window recreation
  displayChangeTimeout = setTimeout(() => {
    console.log("Display change debounce complete, recreating windows");
    
    // Set refreshing flag
    isRefreshing = true;
    
    // Recreate all windows for the current displays
    recreateMatrixWindows();
    
    // Reset flags
    setTimeout(() => {
      isRefreshing = false;
      displayChangeTimeout = null;
      console.log("Window recreation complete");
    }, 2000);
    
  }, 30000); // Much longer delay (30 seconds) to avoid frequent reloads
}

// Handle macOS dock click
app.on('activate', () => {
  // On macOS, recreate windows if dock icon is clicked and all windows are closed
  if (backgroundWindows.length === 0) {
    recreateMatrixWindows();
  } else {
    // Toggle visibility if windows exist
    toggleWallpaperVisibility();
  }
});

// Prevent the app from quitting when all windows are closed
app.on('window-all-closed', () => {
  // On macOS it's common for applications to stay open
  // until the user explicitly quits
  if (process.platform !== 'darwin' && !isQuitting) {
    recreateMatrixWindows();
  }
});

// Add a function to periodically check window visibility
// This helps address issues with window hiding when spaces are switched
function setupVisibilityChecker() {
  // Check visibility every minute
  setInterval(() => {
    // Only check if we have windows and aren't in the middle of a refresh
    if (backgroundWindows.length > 0 && !isRefreshing) {
      const allHidden = backgroundWindows.every(win => !win.isVisible());
      
      // If all windows are hidden but we didn't hide them intentionally, show them
      if (allHidden && !isQuitting) {
        console.log("Windows were unexpectedly hidden, restoring visibility");
        backgroundWindows.forEach(win => {
          if (!win.isDestroyed()) {
            win.show();
          }
        });
      }
    }
  }, 60000); // Check every minute
}
const { app, BrowserWindow, Menu, Tray, ipcMain, screen, globalShortcut, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Disable GPU acceleration to prevent crashes
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-gpu-compositing');
app.commandLine.appendSwitch('disable-gpu-rasterization');
app.commandLine.appendSwitch('disable-software-rasterizer');
// Additional flags for stability
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-dev-shm-usage');
app.commandLine.appendSwitch('disable-accelerated-2d-canvas');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');

// Global variables
let backgroundWindows = [];
let tray = null;
let isRefreshing = false;
let isQuitting = false;
const isDebugMode = process.env.DEBUG_MODE === '1';

// Auto launch at startup
const setupAutoLaunch = () => {
  app.setLoginItemSettings({
    openAtLogin: true,
    openAsHidden: true
  });
};

// Error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

function createBackgroundWindows() {
  // Prevent recursive calls
  if (isRefreshing) return;
  isRefreshing = true;
  
  console.log("Creating background windows...");
  
  // First, close any existing windows
  if (backgroundWindows.length > 0) {
    backgroundWindows.forEach(win => {
      if (!win.isDestroyed()) win.close();
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
      // Create a window that fills this display
      const win = new BrowserWindow({
        x: display.bounds.x,
        y: display.bounds.y,
        width: display.bounds.width,
        height: display.bounds.height,
        transparent: false,
        backgroundColor: '#000000',
        frame: isDebugMode, // Show frame in debug mode
        skipTaskbar: !isDebugMode, // Show in taskbar in debug mode
        alwaysOnTop: isDebugMode, // Always on top in debug mode
        fullscreen: !isDebugMode, // Fullscreen except in debug mode
        title: "Blue Matrix Wallpaper",
        type: isDebugMode ? 'normal' : 'desktop', // Set as desktop type when not in debug mode
        hasShadow: false,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
          backgroundThrottling: false,
          enableRemoteModule: false,
          webSecurity: true,
          // Disable GPU acceleration in the renderer
          offscreen: !isDebugMode,
          disableBlinkFeatures: 'Accelerated2DCanvas,AcceleratedSmil'
        }
      });

      // Load the matrix animation
      win.loadFile('index.html');

      // Make the window ignore mouse events in normal mode, but not in debug mode
      win.setIgnoreMouseEvents(!isDebugMode);
      
      // Position the window at the very bottom of the window stack (like a wallpaper)
      if (!isDebugMode) {
        // Set to not be always on top
        win.setAlwaysOnTop(false);
        
        // On macOS, we need to ensure the window is below desktop icons
        if (process.platform === 'darwin') {
          // Use a lower window level - this is similar to how Plash works
          win.setWindowButtonVisibility(false);
          
          // Set the window level to be below desktop icons
          win.once('ready-to-show', () => {
            // This ensures the window is below desktop icons but above the actual wallpaper
            win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
          });
        }
      }
      
      // Handle renderer crashes
      win.webContents.on('crashed', (event) => {
        console.error('Renderer process crashed, reloading window...');
        setTimeout(() => {
          if (!win.isDestroyed()) {
            win.reload();
          }
        }, 1000);
      });
      
      // Store reference to window
      backgroundWindows.push(win);
      
      // Handle window events
      win.on('closed', () => {
        // Remove from array when closed
        const index = backgroundWindows.indexOf(win);
        if (index > -1) {
          backgroundWindows.splice(index, 1);
        }
      });
    } catch (error) {
      console.error(`Error creating window for display ${i+1}:`, error);
    }
  });
  
  // Hide from dock when running as wallpaper, but not in debug mode
  if (!isDebugMode) {
    app.dock.hide();
  }
  
  // Reset flag after short delay
  setTimeout(() => {
    isRefreshing = false;
  }, 3000);
}

function createTray() {
  try {
    // Create tray icon
    const iconPath = path.join(__dirname, 'icon.png');
    console.log(`Loading tray icon from: ${iconPath}`);
    
    tray = new Tray(iconPath);
    tray.setToolTip('Blue Matrix Wallpaper');
    
    // Create context menu
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show/Hide Wallpaper',
        click: () => {
          toggleWallpaperVisibility();
        }
      },
      {
        label: 'Always on Top',
        type: 'checkbox',
        checked: false,
        click: (menuItem) => {
          setAlwaysOnTop(menuItem.checked);
        }
      },
      {
        label: 'Refresh All Displays',
        click: () => {
          createBackgroundWindows();
        }
      },
      { type: 'separator' },
      {
        label: 'Start at Login',
        type: 'checkbox',
        checked: app.getLoginItemSettings().openAtLogin,
        click: (menuItem) => {
          app.setLoginItemSettings({
            openAtLogin: menuItem.checked,
            openAsHidden: true
          });
        }
      },
      { type: 'separator' },
      {
        label: 'About Blue Matrix Wallpaper',
        click: () => {
          showAboutDialog();
        }
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          app.quit();
        }
      }
    ]);
    
    // Set the context menu
    tray.setContextMenu(contextMenu);
    
    console.log("Tray icon created successfully");
  } catch (error) {
    console.error("Error creating tray icon:", error);
  }
}

// Function to toggle wallpaper visibility
function toggleWallpaperVisibility() {
  if (backgroundWindows.length === 0) {
    createBackgroundWindows();
    return;
  }
  
  const isVisible = backgroundWindows[0].isVisible();
  
  backgroundWindows.forEach(win => {
    if (isVisible) {
      win.hide();
    } else {
      win.show();
      // When showing, ensure proper z-order
      if (!isDebugMode) {
        // Set the window to be below desktop icons but above the actual wallpaper
        win.setAlwaysOnTop(false);
        if (process.platform === 'darwin') {
          win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
        }
      }
    }
  });
}

// Function to set always on top for all windows
function setAlwaysOnTop(value) {
  backgroundWindows.forEach(win => {
    win.setAlwaysOnTop(value);
  });
}

// Function to show about dialog
function showAboutDialog() {
  dialog.showMessageBox({
    type: 'info',
    title: 'About Blue Matrix Wallpaper',
    message: 'Blue Matrix Wallpaper',
    detail: 'A dynamic Matrix-style animation with a blue color scheme for your desktop background.\n\nVersion 1.0.0\n\nUse the tray icon to control the wallpaper.',
    buttons: ['OK'],
    icon: path.join(__dirname, 'icon.png')
  });
}

// Handle display changes with debouncing
let displayChangeTimeout = null;
function handleDisplayChange() {
  if (displayChangeTimeout) {
    clearTimeout(displayChangeTimeout);
  }
  
  displayChangeTimeout = setTimeout(() => {
    console.log('Display metrics changed, refreshing windows');
    createBackgroundWindows();
    displayChangeTimeout = null;
  }, 5000); // Wait 5 seconds before responding to display changes
}

// App lifecycle events
app.whenReady().then(() => {
  // Create background windows
  createBackgroundWindows();
  
  // Create tray icon
  createTray();
  
  // Register global shortcut to toggle visibility
  globalShortcut.register('CommandOrControl+Option+M', () => {
    toggleWallpaperVisibility();
  });
  
  // Listen for display changes
  screen.on('display-metrics-changed', handleDisplayChange);
  screen.on('display-added', handleDisplayChange);
  screen.on('display-removed', handleDisplayChange);
  
  // Set up auto-launch if not in debug mode
  if (!isDebugMode) {
    setupAutoLaunch();
  }
  
  // On macOS, ensure our windows are at the wallpaper level
  if (process.platform === 'darwin' && !isDebugMode) {
    // Use a short delay to ensure windows are created first
    setTimeout(() => {
      backgroundWindows.forEach(win => {
        // Set the window to be below desktop icons but above the actual wallpaper
        win.setAlwaysOnTop(false);
        win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
      });
    }, 1000);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (backgroundWindows.length === 0) {
    createBackgroundWindows();
  }
});

// Global close handler
app.on('before-quit', () => {
  isQuitting = true;
});

app.on('will-quit', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
});

// Handle window close event to prevent accidental closing
ipcMain.on('toggle-click-through', (event, flag) => {
  backgroundWindows.forEach(win => win.setIgnoreMouseEvents(flag));
});
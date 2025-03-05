const { app, BrowserWindow } = require('electron');

// Disable hardware acceleration
app.disableHardwareAcceleration();

app.whenReady().then(() => {
  // Create a simple window that should be visible
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundColor: '#FF0000', // Bright red background
    frame: true,
    show: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // Load a simple HTML content
  win.loadURL('data:text/html,<html><body style="background: red; color: white; font-size: 48px; text-align: center; padding-top: 100px;">TEST WINDOW<br>Can you see this?</body></html>');

  // Log when window is shown
  win.on('show', () => {
    console.log('Window is now visible');
  });

  // Keep window on top
  win.setAlwaysOnTop(true, 'screen-saver');

  // Focus the window
  win.focus();

  console.log('Test window created');
});

app.on('window-all-closed', () => {
  app.quit();
}); 
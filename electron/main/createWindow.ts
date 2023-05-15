import { join } from 'node:path';

import { appConfig } from '@shared/app.config';
import { attachTitlebarToWindow } from 'custom-electron-titlebar/main';
import { BrowserWindow, shell } from 'electron';

import { setupWindowListeners } from '../listeners';
import { store } from '../store';
import { update } from './update';

export const createWindow = async () => {
  const preload = join(__dirname, '../preload/index.js');
  const url = process.env.VITE_DEV_SERVER_URL;
  const indexHtml = join(process.env.DIST, 'index.html');
  const { bounds } = store.get('window');
  const { title } = appConfig;

  const window = new BrowserWindow({
    title,
    icon: join(process.env.PUBLIC, 'favicon.ico'),
    minHeight: 800,
    minWidth: 1280,
    ...bounds,
    show: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  setupWindowListeners(window);

  if (!bounds) {
    window.maximize();
  }

  window.show();

  if (url) {
    // electron-vite-react
    window.loadURL(url);
    // Open devTool if the app is not packaged
    window.webContents.openDevTools();
  } else {
    window.loadFile(indexHtml);
  }

  // Make all links open with the browser, not with the application
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url);
    return { action: 'deny' };
  });

  // Apply electron-updater
  update(window);

  attachTitlebarToWindow(window);

  return window;
};

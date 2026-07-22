import { LocalStorageProvider } from './localStorageProvider.js';

// Factory to get the active storage provider
const getStorageProvider = () => {
  // Can be extended to read from process.env.STORAGE_PROVIDER
  return new LocalStorageProvider();
};

export const storage = getStorageProvider();

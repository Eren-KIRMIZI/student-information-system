import { AsyncLocalStorage } from 'async_hooks';

/**
 * AsyncLocalStorage, Node.js'te bir request (veya herhangi bir asenkron işlem zinciri)
 * boyunca verileri taşımamızı sağlayan yapıdır.
 *
 * Hiyerarşi:
 * AsyncLocalStorage -> Request Context -> Logger -> Trace -> CorrelationID -> RequestID
 */
const asyncLocalStorage = new AsyncLocalStorage();

/**
 * Context'i başlatır ve içindeki asenkron zincir boyunca devam ettirir.
 * @param {Object} context - Başlangıç verileri (requestId, traceId vb.)
 * @param {Function} next - Çalıştırılacak asenkron fonksiyon
 */
export const runWithContext = (context, next) => {
  const currentStore = asyncLocalStorage.getStore() || {};
  const mergedContext = { ...currentStore, ...context };
  asyncLocalStorage.run(mergedContext, next);
};

/**
 * Mevcut context'i döner. Context başlatılmamışsa boş obje döner.
 * @returns {Object}
 */
export const getContext = () => {
  return asyncLocalStorage.getStore() || {};
};

/**
 * Context içerisine spesifik bir key-value atar.
 * @param {string} key
 * @param {any} value
 */
export const setContextValue = (key, value) => {
  const store = asyncLocalStorage.getStore();
  if (store) {
    store[key] = value;
  }
};

/**
 * Context'ten spesifik bir değeri döner.
 * @param {string} key
 * @returns {any}
 */
export const getContextValue = (key) => {
  const store = asyncLocalStorage.getStore();
  return store ? store[key] : null;
};

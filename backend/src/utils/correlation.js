import { AsyncLocalStorage } from 'async_hooks';

const asyncLocalStorage = new AsyncLocalStorage();

export const runWithCorrelation = (correlationId, fn) => {
  return asyncLocalStorage.run({ correlationId }, fn);
};

export const getCorrelationId = () => {
  return asyncLocalStorage.getStore()?.correlationId || null;
};

import { setContextValue, getContextValue, runWithContext } from '../observability/context.js';

export const runWithCorrelation = (correlationId, fn) => {
  // Eski kod direkt asyncLocalStorage.run diyordu.
  // Şimdi context zaten req_id middleware'de başlatılacak,
  // ama geriye dönük uyumluluk için, eğer context yoksa başlat, varsa sadece set et.
  const currentCtx = getContextValue('correlationId');
  if (currentCtx === undefined) {
    return runWithContext({ correlationId }, fn);
  } else {
    setContextValue('correlationId', correlationId);
    return fn();
  }
};

export const getCorrelationId = () => {
  return getContextValue('correlationId') || null;
};

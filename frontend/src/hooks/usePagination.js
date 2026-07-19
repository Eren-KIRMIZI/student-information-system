import { useState, useCallback, useRef, useEffect } from 'react';

export const usePagination = (initialPage = 1) => {
  const [page, setPage] = useState(initialPage);
  const goTo = useCallback((p) => setPage(p), []);
  const next = useCallback(() => setPage((p) => p + 1), []);
  const prev = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
  const reset = useCallback(() => setPage(1), []);
  return { page, setPage, goTo, next, prev, reset };
};

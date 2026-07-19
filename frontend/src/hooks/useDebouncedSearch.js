import { useState, useRef, useEffect } from 'react';

export const useDebouncedSearch = (delay = 400) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedSearch(search), delay);
    return () => clearTimeout(timerRef.current);
  }, [search, delay]);

  const reset = () => {
    setSearch('');
    setDebouncedSearch('');
  };

  return { search, setSearch, debouncedSearch, reset };
};

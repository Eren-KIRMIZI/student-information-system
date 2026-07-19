import { useState, useCallback } from 'react';

export const useFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const resetPageOnFilter = useCallback((key, value, resetPage) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (resetPage) resetPage();
  }, []);

  return { filters, setFilter, setFilters, clearFilters, resetPageOnFilter };
};

import { useState, useCallback } from 'react';

export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const openAdd = useCallback(() => {
    setEditItem(null);
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((item) => {
    setEditItem(item);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setEditItem(null);
  }, []);

  return { isOpen, editItem, openAdd, openEdit, close, setIsOpen };
};

export const useConfirmDialog = () => {
  const [item, setItem] = useState(null);
  const open = useCallback((target) => setItem(target), []);
  const close = useCallback(() => setItem(null), []);
  return { item, isOpen: !!item, open, close };
};

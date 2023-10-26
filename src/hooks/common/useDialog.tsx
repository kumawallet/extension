import { useState, useCallback } from "react";

export const useDialog = (defaultState = false) => {
  const [isOpen, setIsOpen] = useState(defaultState);

  const openDialog = useCallback(() => setIsOpen(true), []);

  const closeDialog = useCallback(() => setIsOpen(false), []);

  return {
    isOpen,
    openDialog,
    closeDialog,
  };
};

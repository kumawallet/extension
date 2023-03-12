import { useState, useCallback } from "react";

export const useLoading = (defaultState = false) => {
  const [isLoading, setIsLoading] = useState(defaultState);

  const starLoading = useCallback(() => setIsLoading(true), []);

  const endLoading = useCallback(() => setIsLoading(false), []);

  return {
    isLoading,
    starLoading,
    endLoading,
  };
};

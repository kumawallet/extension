import { useState } from "react";

export const useLoading = (defaultState = false) => {
  const [isLoading, setIsLoading] = useState(defaultState);

  const starLoading = () => setIsLoading(true);

  const endLoading = () => setIsLoading(false);

  return {
    isLoading,
    starLoading,
    endLoading,
  };
};

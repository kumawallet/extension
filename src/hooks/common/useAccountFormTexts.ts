import { useState } from "react";

export const useAccountFormTexts = () => {
  const [texts, setTexts] = useState<{
    title: string;
    description: string;
    button: string;
  }>({
    title: "",
    description: "",
    button: "",
  });

  return {
    texts,
    setTexts,
  };
};

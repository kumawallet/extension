import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNetworkContext } from "../networkProvider";

const initialState = {
  color: "chain-default",
};

const ThemeContext = createContext(
  {} as {
    color: string;
  }
);

export const ThemeProvider: FC<PropsWithChildren> = ({ children }) => {
  const {
    state: { selectedChain, chains },
  } = useNetworkContext();

  const [color, setColor] = useState(
    () => localStorage.getItem("color") || initialState.color
  );

  useEffect(() => {
    if (selectedChain?.name) {
      const isCustom = chains?.custom?.find(
        (chain) => chain.name === selectedChain.name
      );

      const color = !isCustom
        ? `chain-${selectedChain.name.toLowerCase().replace(/ /g, "-")}`
        : initialState.color;
      setColor(color);
      localStorage.setItem("color", color);
    }
  }, [selectedChain, chains]);

  return (
    <ThemeContext.Provider
      value={{
        color,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);

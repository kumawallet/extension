import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNetworkContext } from "../networkProvider";


const DEFAULT_COLOR = "chain-default"

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
    () => localStorage.getItem("color") || DEFAULT_COLOR
  );

  useEffect(() => {
    if (selectedChain?.name) {
      const isCustom = chains?.custom?.find(
        (chain) => chain.name === selectedChain.name
      );

      const isTestnet = chains?.testnets?.find(
        (chain) => chain.name === selectedChain.name
      )

      const color = !isCustom && !isTestnet
        ? `chain-${selectedChain.name.toLowerCase().replace(/ /g, "-")}`
        : DEFAULT_COLOR;
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

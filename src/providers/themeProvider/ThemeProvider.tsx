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
    state: { selectedChain },
  } = useNetworkContext();

  const [color, setColor] = useState(
    () => localStorage.getItem("color") || DEFAULT_COLOR
  );

  useEffect(() => {
    if (selectedChain?.name) {


      const isCustomOrTestnet = selectedChain.isCustom || selectedChain.isTestnet;

      const color = !isCustomOrTestnet
        ? `chain-${selectedChain.name.toLowerCase().replace(/ /g, "-")}`
        : DEFAULT_COLOR;
      setColor(color);
      localStorage.setItem("color", color);
    }
  }, [selectedChain]);

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

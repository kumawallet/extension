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
    state: { selectedChain },
  } = useNetworkContext();

  const [color, setColor] = useState(
    () => localStorage.getItem("color") || initialState.color
  );

  useEffect(() => {
    if (selectedChain?.name) {
      const color = `chain-${selectedChain.name.toLowerCase()}`;
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

import { FC } from "react";
import { Background1, Background2, Star } from "../icons";

interface ColoredBackgroundProps {
  bg1ClassName?: string;
  bg2ClassName?: string;
  starClassName?: string;
}

export const ColoredBackground: FC<ColoredBackgroundProps> = ({
  bg1ClassName,
  bg2ClassName,
  starClassName,
}) => (
  <>
    <Background1 className={`absolute top-0 right-0 w-[60%] h-[30%] ${bg1ClassName}`} />
    <Background2 className={`absolute bottom-0 left-0 w-[85%] h-[45%] ${bg2ClassName}`} />
    <Star className={`absolute top-3 right-3 w-[33px] h-[33px] ${starClassName}`} />
  </>
);

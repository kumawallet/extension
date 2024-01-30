import { Background1, Background2, Star } from "../ui";

export const ColoredBackground = () => (
  <>
    <Background1 className="absolute top-0 right-0 w-[60%] h-[30%]" />
    <Background2 className="absolute bottom-0 left-0 w-[85%] h-[45%]" />

    <Star className="absolute top-3 right-3 w-[33px] h-[33px]" />
  </>
);

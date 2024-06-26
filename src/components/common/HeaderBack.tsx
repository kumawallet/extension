import { CSSProperties, FC } from "react";
import { FiChevronLeft } from "react-icons/fi";
import { iconBack, textHeaderBack } from "@src/styles/general";
import { ICON_SIZE } from "@src/constants/icons";
import { styleHeaderBack } from "@src/components/common/styles/HeaderBack";
interface HeaderProps {
  classname?: string;
  style?: CSSProperties;
  navigate: (path: number) => void;
  title: string;
  classNameContainer?: string;
}

export const HeaderBack: FC<HeaderProps> = ({
  classname,
  title,
  style,
  navigate,
  classNameContainer,
}) => {
  return (
    <div className={`${styleHeaderBack.container} ${classNameContainer} `}>
      <FiChevronLeft
        className={`${classname} ${iconBack}`}
        size={ICON_SIZE}
        onClick={() => navigate(-1)}
        style={style}
      />
      <p className={textHeaderBack}  onClick={() => navigate(-1)}>{title}</p>
    </div>
  );
};

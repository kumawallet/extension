import { CSSProperties, FC , PropsWithChildren, HTMLAttributes } from "react";
import { FiChevronLeft } from "react-icons/fi";
import { iconBack, textHeaderBack } from "@src/styles/general";
import { ICON_SIZE } from "@src/constants/icons";
import { styleHeaderBack } from "@src/components/common/styles/HeaderBack";

interface HeaderProps extends PropsWithChildren {
  classname?: string;
  style?: CSSProperties;
  navigate?: (path: number) => void;
  title: string;
  classNameContainer?: string;
  onBack?: () => void;
  classnameText?: string;
}

export const HeaderBack: FC<HeaderProps> = ({
  classname,
  title,
  style,
  navigate,
  classNameContainer,
  onBack,
  classnameText,
  children
}) => {

  const handlerClick = () => {
    if (typeof onBack === "function") {
      onBack();
    } else {
      navigate && navigate(-1);
    }
  };

  return (
    <div className={`${styleHeaderBack.container} ${classNameContainer} `}>
      <FiChevronLeft
        data-testid="back-button"
        className={`${classname} ${iconBack}`}
        size={ICON_SIZE}
        onClick={handlerClick}
        style={style}
      />
      <p
        className={`${textHeaderBack} ${classnameText}`}
        onClick={handlerClick}
      >
        {title}
      </p>

      {children}
    </div>
  );
};

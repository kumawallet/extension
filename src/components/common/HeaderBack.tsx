import {
    CSSProperties,
    FC,
    HTMLAttributes,
  } from "react";
  import { FiChevronLeft } from "react-icons/fi";
  import { iconBack,textHeaderBack} from '@src/pages/style/general'
  import { ICON_SIZE } from '@src/constants/icons'
  interface HeaderProps {
    classname?: HTMLAttributes<HTMLButtonElement>["className"];
    style?: CSSProperties;
    navigate:(path: number) => void;
    title: string;
  }
 
  export const HeaderBack: FC<HeaderProps > = ({
    classname,
    title,
    style,
    navigate,
  }) => {
  
    return (<div className="flex items-center mb-10">
    <FiChevronLeft
      className={`${iconBack} ${classname}`}
      size={ICON_SIZE}
      onClick={() => navigate(-1)}
      style={style}
    />
    <a />
    <p className={textHeaderBack}>{title}</p>
    <></>
  </div>);
  };
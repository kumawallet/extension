import { type FC } from "react";
import { type IconType } from "react-icons"

interface FooterIconProps {
  icon: IconType;
  onClick?: () => void;
}

export const FooterIcon: FC<FooterIconProps> = ({
  icon: Icon,
  onClick,
}) => {
  return (
    <button
      className="flex justify-center items-center p-2 rounded-lg hover:bg-gray-500 hover:bg-opacity-20 transition-colors"
      onClick={onClick || undefined}
    >
      <Icon size={24} />
    </button>
  );
}
import { FC, PropsWithChildren } from "react";

interface OpionButtonProps extends PropsWithChildren {
  onClick?: () => void;
}

export const OptionButton: FC<OpionButtonProps> = ({ children, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex justify-between items-center py-5 px-5 rounded-md bg-custom-gray-bg hover:bg-custom-gray-hover"
    >
      {children}
    </button>
  );
};

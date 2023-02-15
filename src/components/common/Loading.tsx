import { FC } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const DEFAULT_CONTAINER_CLASSNAME = "flex justify-center py-3";
const DEFAULT_ICON_CLASSNAME =
  "w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600";

interface LoadingProps {
  containerClass?: HTMLElement["className"];
  iconClass?: HTMLElement["className"];
}

export const Loading: FC<LoadingProps> = ({ containerClass, iconClass }) => {
  return (
    <div className={containerClass || DEFAULT_CONTAINER_CLASSNAME}>
      <AiOutlineLoading3Quarters
        className={iconClass || DEFAULT_ICON_CLASSNAME}
      />
    </div>
  );
};

import { FC, PropsWithChildren, HTMLAttributes } from "react";

interface PageWrapperProps extends PropsWithChildren {
  contentClassName?: HTMLAttributes<HTMLDivElement>["className"];
  innerContentClassName?: HTMLAttributes<HTMLDivElement>["className"];
}

export const PageWrapper: FC<PageWrapperProps> = ({
  children,
  contentClassName,
  innerContentClassName = "",
}) => {
  const defaultContentClassName = "flex flex-1";

  return (
    <div className={`${defaultContentClassName} ${contentClassName || ""}`}>
      <div className={`max-w-[357px] w-full mx-auto px-4 sm:border-x-2 sm:border-x-[#393A3A] py-4 relative ${innerContentClassName} bg-[#171720] `}>{children}</div>
    </div>
  );
};

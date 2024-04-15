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
  const defaultContentClassName = "flex px-4";

  return (
    <div className={`${defaultContentClassName} ${contentClassName || ""}`}>
      <div className={`max-w-[357px] w-full mx-auto md:px-4 sm:border-x-2 sm:border-x-[#393A3A] h-[100vh] py-4 relative ${innerContentClassName}`}>{children}</div>
    </div>
  );
};

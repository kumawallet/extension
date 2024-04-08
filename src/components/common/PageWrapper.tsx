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
  const defaultContentClassName = "flex py-6 px-4";

  return (
    <div className={`${defaultContentClassName} ${contentClassName || ""}`}>
      <div className={`max-w-[400px] w-full mx-auto md:px-10 relative ${innerContentClassName}`}>{children}</div>
    </div>
  );
};

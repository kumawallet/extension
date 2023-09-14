import { HTMLAttributes } from "react";
import { FC, PropsWithChildren } from "react";

interface PageWrapperProps extends PropsWithChildren {
  contentClassName?: HTMLAttributes<HTMLDivElement>["className"];
  innerContentClassName?: HTMLAttributes<HTMLDivElement>["className"];
}

export const PageWrapper: FC<PageWrapperProps> = ({
  children,
  contentClassName,
  innerContentClassName
}) => {
  const defaultContentClassName = "flex py-6 px-4";

  return (
    <div className={`${defaultContentClassName} ${contentClassName || ""}`}>
      <div className={`max-w-3xl w-full mx-auto md:px-10 h-full ${innerContentClassName}`}>{children}</div>
    </div>
  );
};

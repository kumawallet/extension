import { FC, PropsWithChildren, HTMLAttributes } from "react";

interface PageWrapperProps extends PropsWithChildren {
  contentClassName?: HTMLAttributes<HTMLDivElement>["className"];
}

export const PageWrapper: FC<PageWrapperProps> = ({
  children,
  contentClassName,
}) => {
  const defaultContentClassName = "flex py-6 px-4";

  return (
    <div className={`${defaultContentClassName} ${contentClassName || ""}`}>
      <div className="max-w-3xl w-full mx-auto md:px-10 relative">{children}</div>
    </div>
  );
};

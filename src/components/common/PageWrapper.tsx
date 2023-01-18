import { HTMLAttributes } from "react";
import { FC, PropsWithChildren } from "react";

interface PageWrapperProps extends PropsWithChildren {
  contentClassName?: HTMLAttributes<HTMLDivElement>["className"];
}

export const PageWrapper: FC<PageWrapperProps> = ({
  children,
  contentClassName,
}) => {
  const defaultContentClassName = "flex py-6 px-4";

  return (
    <div className={contentClassName || defaultContentClassName}>
      <div className="max-w-3xl w-full mx-auto text-center  md:px-10">
        {children}
      </div>
    </div>
  );
};

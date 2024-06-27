import { type FC } from "react";

interface ASteriskCircleProps {
  className?: string;
}

export const ASteriskCircle: FC<ASteriskCircleProps> = ({
  className = ""
}) => (
  <svg className={className} width="30" height="31" viewBox="0 0 30 31" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 20.1567V10.1567M10.6699 17.6567L19.3301 12.6567M10.6699 12.6567L19.3301 17.6567M28.75 15.1567C28.75 22.7507 22.5939 28.9067 15 28.9067C7.40608 28.9067 1.25 22.7507 1.25 15.1567C1.25 7.56282 7.40608 1.40674 15 1.40674C22.5939 1.40674 28.75 7.56282 28.75 15.1567Z" stroke="#FFFDFD" strokeWidth="2" strokeLinecap="round" />
  </svg>
)
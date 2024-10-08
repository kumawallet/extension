import { FC } from "react";

interface LinkUrlProps {
  url: string;
  content: string;
}

export const LinkUrl: FC<LinkUrlProps> = ({ url, content }) => {
  return (
    <a href={url} target="__blank" className="text-[#3D8FEF]">
      {content}
    </a>
  );
};

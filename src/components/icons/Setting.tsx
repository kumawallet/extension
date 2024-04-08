import { FC } from "react";

interface SettingProps {
  className?: string;
  color?: string;
  size?: string;
}

export const Setting: FC<SettingProps> = ({
  className = "",
  color = "white",
  size = "47"
}) => (
  <svg width={size} height={size} viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
<path d="M3.67993 10.5898C3.67993 6.72385 6.81394 3.58984 10.6799 3.58984C14.5459 3.58984 17.6799 6.72385 17.6799 10.5898C17.6799 14.4558 14.5459 17.5898 10.6799 17.5898C6.81394 17.5898 3.67993 14.4558 3.67993 10.5898Z" stroke={color} stroke-width="2"/>
<path d="M3.67993 31.5898C3.67993 27.7239 6.81394 24.5898 10.6799 24.5898C14.5459 24.5898 17.6799 27.7239 17.6799 31.5898C17.6799 35.4558 14.5459 38.5898 10.6799 38.5898C6.81394 38.5898 3.67993 35.4558 3.67993 31.5898Z" stroke={color} stroke-width="2"/>
<path d="M24.6799 10.5898C24.6799 6.72385 27.8139 3.58984 31.6799 3.58984C35.5459 3.58984 38.6799 6.72385 38.6799 10.5898C38.6799 14.4558 35.5459 17.5898 31.6799 17.5898C27.8139 17.5898 24.6799 14.4558 24.6799 10.5898Z" stroke={color} stroke-width="2"/>
<path d="M24.6799 31.5898C24.6799 27.7239 27.8139 24.5898 31.6799 24.5898C35.5459 24.5898 38.6799 27.7239 38.6799 31.5898C38.6799 35.4558 35.5459 38.5898 31.6799 38.5898C27.8139 38.5898 24.6799 35.4558 24.6799 31.5898Z" stroke={color} stroke-width="2"/>
</svg>


)
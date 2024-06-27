import { FC } from "react";

interface MaximizeProps {
  className?: string;
  color?: string;
  size?: string;
}

export const Maximize: FC<MaximizeProps> = ({
  className = "",
  color = "white",
  size = "83"
}) => (
  <svg width={size} height={size} viewBox="0 0 83 83" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M30.8175 75.3317H51.3625C68.4833 75.3317 75.3316 68.4833 75.3316 51.3625V30.8175C75.3316 13.6967 68.4833 6.84839 51.3625 6.84839H30.8175C13.6967 6.84839 6.84833 13.6967 6.84833 30.8175V51.3625C6.84833 68.4833 13.6967 75.3317 30.8175 75.3317Z" stroke="#B0B0CE" strokeWidth="5.13625" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M61.6349 20.5449L20.5449 61.6349" stroke={color} strokeWidth="5.13625" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M61.6349 34.2416V20.5449H47.9382" stroke={color} strokeWidth="5.13625" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20.5449 47.9382V61.6349H34.2416" stroke={color} strokeWidth="5.13625" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20.5449 20.5449L61.6349 61.6349" stroke={color} strokeWidth="5.13625" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20.5449 34.2416V20.5449H34.2416" stroke={color} strokeWidth="5.13625" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M61.6349 47.9382V61.6349H47.9382" stroke={color} strokeWidth="5.13625" strokeLinecap="round" strokeLinejoin="round" />
  </svg>


)
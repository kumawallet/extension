import { FC } from "react";

interface SwapProps {
  className?: string;
  color?: string
}

export const Swap: FC<SwapProps> = ({ className = "", color = "white" }) => (
  <svg width="44" height="45" viewBox="0 0 44 45" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
  >
    <path d="M31.5542 37.1485C36.2097 34.053 39.2781 28.7599 39.2781 22.75C39.2781 13.2076 31.5424 5.47192 22 5.47192C20.6803 5.47192 19.3952 5.61986 18.1604 5.90008M31.5542 37.1485V31.8438M31.5542 37.1485H37.4594M12.401 8.38147C7.77054 11.481 4.72186 16.7595 4.72186 22.75C4.72186 32.2925 12.4575 40.0282 22 40.0282C23.3197 40.0282 24.6048 39.8803 25.8396 39.6M12.401 8.38147V13.6563M12.401 8.38147H6.54061" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
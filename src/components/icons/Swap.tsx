import { FC } from "react";

interface SwapProps {
  className?: string;
  color?: string;
  size?: string;
}

export const Swap: FC<SwapProps> = ({ className = "", color = "white", size = "5" }) => (
  <svg width={size} height={size} viewBox="0 0 32 31" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M30.2083 20.6279C30.2083 25.6267 26.1654 29.6696 21.1666 29.6696L22.5229 27.4092" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M1.79169 10.2946C1.79169 5.29585 5.8346 1.25293 10.8334 1.25293L9.47711 3.51335" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19.6812 19.8012C19.6812 24.2058 16.1162 27.7707 11.7117 27.7707C7.30707 27.7707 3.74207 24.2058 3.74207 19.8012C3.74207 15.3966 7.30707 11.8315 11.7117 11.8315C11.9183 11.8315 12.1121 11.8445 12.3317 11.8574C16.2454 12.1545 19.3712 15.2803 19.6683 19.1941C19.6683 19.3878 19.6812 19.5816 19.6812 19.8012Z" stroke={color} strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M28.2708 11.1986C28.2708 15.6031 24.7058 19.1682 20.3013 19.1682H19.6683C19.3712 15.2545 16.2454 12.1286 12.3317 11.8315V11.1986C12.3317 6.79398 15.8967 3.229 20.3013 3.229C24.7058 3.229 28.2708 6.79398 28.2708 11.1986Z" stroke={color} strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
  </svg>

)
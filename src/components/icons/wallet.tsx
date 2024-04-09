import { FC } from "react";

interface WalletProps {
  className?: string;
  color?: string;
  size?: string;
}

export const IconWallet: FC<WalletProps> = ({ className = "", color = "white", size = "30" }) => (
  <svg width={size} height={size} viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M22.55 16.9375C22.025 17.45 21.725 18.1875 21.8 18.975C21.9125 20.325 23.15 21.3125 24.5 21.3125H26.875V22.8C26.875 25.3875 24.7625 27.5 22.175 27.5H9.5375C9.925 27.175 10.2625 26.775 10.525 26.325C10.9875 25.575 11.25 24.6875 11.25 23.75C11.25 20.9875 9.0125 18.75 6.25 18.75C5.075 18.75 3.9875 19.1625 3.125 19.85V14.3875C3.125 11.8 5.2375 9.6875 7.825 9.6875H22.175C24.7625 9.6875 26.875 11.8 26.875 14.3875V16.1875H24.35C23.65 16.1875 23.0125 16.4625 22.55 16.9375Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.125 15.5126V9.80019C3.125 8.31269 4.0375 6.98764 5.425 6.46264L15.35 2.71264C16.9 2.12514 18.5625 3.27517 18.5625 4.93767V9.68766" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M28.1985 17.4624V20.0375C28.1985 20.725 27.6485 21.2875 26.9485 21.3125H24.4985C23.1485 21.3125 21.911 20.325 21.7985 18.975C21.7235 18.1875 22.0235 17.45 22.5485 16.9375C23.011 16.4625 23.6485 16.1875 24.3485 16.1875H26.9485C27.6485 16.2125 28.1985 16.7749 28.1985 17.4624Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.75 15H17.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11.25 23.75C11.25 24.6875 10.9875 25.575 10.525 26.325C10.2625 26.775 9.925 27.175 9.5375 27.5C8.6625 28.2875 7.5125 28.75 6.25 28.75C4.425 28.75 2.8375 27.775 1.975 26.325C1.5125 25.575 1.25 24.6875 1.25 23.75C1.25 22.175 1.975 20.7625 3.125 19.85C3.9875 19.1625 5.075 18.75 6.25 18.75C9.0125 18.75 11.25 20.9875 11.25 23.75Z" stroke={color} strokeWidth="1.5" stroke-miterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.11464 23.7246H4.38965" stroke={color} strokeWidth="1.5" stroke-miterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.25 21.8994V25.6369" stroke={color} strokeWidth="1.5" stroke-miterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
  </svg>


)
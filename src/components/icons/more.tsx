import { FC } from "react";

interface MoreProps {
  className?: string;
  color?: string;
  size?: string;
}

export const More: FC<MoreProps> = ({
  className = "",
  color = "white",
  size = "24"
}) => (
    <svg width={size} height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12.0001 9.32C13.1901 9.32 14.1601 8.35 14.1601 7.16C14.1601 5.97 13.1901 5 12.0001 5C10.8101 5 9.84009 5.97 9.84009 7.16C9.84009 8.35 10.8101 9.32 12.0001 9.32Z" stroke={color} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M6.78988 18.9997C7.97988 18.9997 8.94988 18.0297 8.94988 16.8397C8.94988 15.6497 7.97988 14.6797 6.78988 14.6797C5.59988 14.6797 4.62988 15.6497 4.62988 16.8397C4.62988 18.0297 5.58988 18.9997 6.78988 18.9997Z" stroke={color} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M17.21 18.9997C18.4 18.9997 19.37 18.0297 19.37 16.8397C19.37 15.6497 18.4 14.6797 17.21 14.6797C16.02 14.6797 15.05 15.6497 15.05 16.8397C15.05 18.0297 16.02 18.9997 17.21 18.9997Z" stroke="#FBFDFE" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    
)
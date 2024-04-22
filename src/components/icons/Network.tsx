import { FC } from "react";

interface NetworkProps {
  className?: string;
  color?: string;
  size?: string;
}

export const Network: FC<NetworkProps> = ({
  className = "",
  color = "white",
  size = "41"
}) => (
    <svg width="20" height={size} viewBox={`0 0 15 41`} fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M10 16.4658C14.4183 16.4658 18 13.2275 18 9.23288C18 8.23422 17.1046 7.42466 16 7.42466H4C2.89543 7.42466 2 8.23422 2 9.23288C2 13.2275 5.58172 16.4658 10 16.4658ZM10 16.4658V34.5479C10 36.5452 8.20914 38.1644 6 38.1644C3.79086 38.1644 2 36.5452 2 34.5479V25.5068M6 7.42466V2M14 7.42466V2" stroke={color} stroke-width="4" stroke-linecap="round"/>
    </svg>
    


)
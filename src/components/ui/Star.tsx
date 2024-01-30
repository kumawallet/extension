import { FC } from "react";

interface StarProps {
  className?: string;
}

export const Star: FC<StarProps> = ({
  className = ""
}) => (
  <svg width="97" height="95" viewBox="0 0 97 95" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M48.8581 0L49.6722 21.9661C50.1703 35.4049 60.9534 46.1825 74.3924 46.6737L97 47.5L74.3924 48.3263C60.9534 48.8175 50.1703 59.5951 49.6722 73.0339L48.8581 95L48.044 73.0339C47.5459 59.5951 36.7628 48.8175 23.3237 48.3263L0.716187 47.5L23.3237 46.6737C36.7628 46.1825 47.5459 35.4049 48.044 21.9661L48.8581 0Z" fill="white" fillOpacity="0.71" />
  </svg>

)
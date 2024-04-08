import { FC } from "react";

interface SendProps {
  className?: string;
  color?: string;
  size?: string;
}

export const Send: FC<SendProps> = ({
  className = "",
  color = "white",
  size = "5"
}) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
<path d="M10.0143 9.03121L20.9805 5.37579C25.9018 3.73538 28.5755 6.42204 26.948 11.3433L23.2926 22.3095C20.8385 29.685 16.8085 29.685 14.3543 22.3095L13.2693 19.0545L10.0143 17.9695C2.63887 15.5154 2.63887 11.4983 10.0143 9.03121Z" stroke={color} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M13.5147 18.4989L18.1389 13.8618" stroke={color} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

)
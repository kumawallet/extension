import { FC } from "react";

interface SendProps {
  className?: string;
  color?: string;
}

export const Send: FC<SendProps> = ({
  className = "",
  color = "white",
}) => (
  <svg width="44" height="45" viewBox="0 0 44 45" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M38.4545 6.00441C34.4935 1.7387 4.69855 12.1882 4.72316 16.0034C4.75106 20.3297 16.3589 21.6606 19.5762 22.5633C21.5111 23.106 22.0292 23.6625 22.4753 25.6914C24.4958 34.8798 25.5102 39.45 27.8223 39.552C31.5075 39.715 42.3202 10.1674 38.4545 6.00441Z" stroke={color} strokeWidth="1.72291" />
  </svg>
)
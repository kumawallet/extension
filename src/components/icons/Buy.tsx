import { CSSProperties, FC } from "react"

interface BuyProps {
  className?: string;
  style?: CSSProperties;
  color?: string;
  size?: string;
}

export const Buy: FC<BuyProps> = ({
  className,
  style,
  color = "white",
  size = "5"
}) => (
  <svg width={size} height={size} viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M2.54456 22.0376H15.2675" stroke={color} strokeWidth="1.9375" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5.36901 17.4385H12.443C14.7077 17.4385 15.2675 18.0068 15.2675 20.2801V25.5889C15.2675 27.8622 14.7077 28.4306 12.443 28.4306H5.36901C3.10433 28.4306 2.54456 27.8622 2.54456 25.5889V20.2801C2.54456 18.0068 3.10433 17.4385 5.36901 17.4385Z" stroke={color} strokeWidth="1.9375" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M27.9905 19.375C27.9905 24.3738 24.0082 28.4167 19.0845 28.4167L20.4204 26.1563" stroke={color} strokeWidth="1.9375" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.54456 11.6252C2.54456 6.62641 6.52683 2.5835 11.4506 2.5835L10.1147 4.84391" stroke={color} strokeWidth="1.9375" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M23.5374 14.2095C26.6994 14.2095 29.2628 11.6071 29.2628 8.39697C29.2628 5.18682 26.6994 2.58447 23.5374 2.58447C20.3754 2.58447 17.8121 5.18682 17.8121 8.39697C17.8121 11.6071 20.3754 14.2095 23.5374 14.2095Z" stroke={color} strokeWidth="1.9375" strokeLinecap="round" strokeLinejoin="round" />
  </svg>


)
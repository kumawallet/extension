import { CSSProperties, FC } from "react"

interface BuyProps {
  className?: string
  style?: CSSProperties
  color?: string
}

export const Buy: FC<BuyProps> = ({
  className,
  style,
  color = ""
}) => (
  <svg width="44" height="45" viewBox="0 0 44 45" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <g id="dollar-01">
      <path id="Vector" d="M32.8366 16.1824C32.8366 12.2761 27.9849 9.10944 22 9.10944C16.015 9.10944 11.1633 12.2761 11.1633 16.1824C11.1633 20.0887 14.1187 22.2448 22 22.2448C29.8812 22.2448 33.8219 24.2656 33.8219 29.3177C33.8219 34.3699 28.5291 36.3907 22 36.3907C15.4709 36.3907 10.1781 33.2241 10.1781 29.3177" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path id="Vector_2" d="M22.9094 5.47192V8.58199M22.9094 40.0282V36.9181" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </svg>

)
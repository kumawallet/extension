import { type FC } from "react";

interface Background1Props {
  className?: string;
}

export const Background1: FC<Background1Props> = ({
  className = ""
}) => (
  <svg width="625" height="580" viewBox="0 0 625 644" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g filter="url(#filter0_f_1196_715)">
      <circle cx="840.5" cy="-196.5" r="540.5" fill="#6C387A" />
    </g>
    <defs>
      <filter id="filter0_f_1196_715" x="0" y="-1037" width="1681" height="1681" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feGaussianBlur stdDeviation="150" result="effect1_foregroundBlur_1196_715" />
      </filter>
    </defs>
  </svg>

)
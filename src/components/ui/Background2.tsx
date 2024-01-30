import { type FC } from "react";

interface Background2Props {
  className?: string;
}


export const Background2: FC<Background2Props> = ({
  className
}) => (
  <svg width="847" height="767" viewBox="0 0 847 767" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g filter="url(#filter0_f_1197_742)">
      <path d="M-69.3357 987.312C-343.836 973.312 -565.336 793.812 -475.836 611.812C-386.336 429.811 -246.336 435.311 65.1645 331.812C376.664 228.312 572.164 399.312 544.164 530.812C516.164 662.311 205.164 1001.31 -69.3357 987.312Z" fill="#6C387A" />
    </g>
    <defs>
      <filter id="filter0_f_1197_742" x="-796" y="0" width="1642.82" height="1287.73" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feGaussianBlur stdDeviation="150" result="effect1_foregroundBlur_1197_742" />
      </filter>
    </defs>
  </svg>
)
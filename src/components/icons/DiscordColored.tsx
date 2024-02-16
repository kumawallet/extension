import { FC } from 'react'

interface DiscordColoredProps {
  className: string
}

export const DiscordColored: FC<DiscordColoredProps> = ({
  className
}) => {
  return (
    <svg width="41" height="40" viewBox="0 0 41 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="0.962891" width="39.4375" height="39.4375" rx="14.7891" fill="#005CA6" />
      <g clipPath="url(#clip0_1510_956)">
        <path d="M28.4925 22.4562L26.2664 15.0447C26.2237 14.8948 26.1471 14.7567 26.0428 14.6409C25.9383 14.5252 25.8088 14.4349 25.6641 14.3769H25.6248L25.6641 14.3638C24.9337 14.0711 24.1774 13.8475 23.4053 13.696C23.3378 13.6826 23.2683 13.6827 23.2009 13.6962C23.1334 13.7097 23.0693 13.7364 23.0121 13.7747C22.955 13.813 22.9059 13.8622 22.8678 13.9195C22.8297 13.9767 22.8032 14.041 22.7899 14.1085C22.7755 14.1756 22.7747 14.2448 22.7875 14.3123C22.8001 14.3797 22.8262 14.4439 22.864 14.5012C22.9017 14.5585 22.9505 14.6077 23.0074 14.6459C23.0644 14.6841 23.1285 14.7106 23.1957 14.7239C23.4904 14.7828 23.7785 14.8548 24.06 14.9334C24.1637 14.9872 24.2464 15.0742 24.295 15.1804C24.3436 15.2867 24.3553 15.4061 24.3282 15.5198C24.3011 15.6334 24.2368 15.7347 24.1455 15.8076C24.0542 15.8805 23.9411 15.9208 23.8243 15.922H23.7719C22.763 15.6589 21.7243 15.5269 20.6816 15.5292C19.6634 15.5262 18.6491 15.6538 17.6634 15.9089C17.5379 15.942 17.4047 15.9274 17.2894 15.8679C17.1742 15.8084 17.0851 15.7082 17.0394 15.5868C16.9938 15.4653 16.9949 15.3313 17.0424 15.2106C17.0899 15.0899 17.1805 14.9911 17.2967 14.9334H17.3033C17.5848 14.8548 17.8729 14.7828 18.1675 14.7239C18.235 14.7106 18.2992 14.6841 18.3565 14.646C18.4137 14.6078 18.4629 14.5588 18.5012 14.5016C18.5395 14.4445 18.5662 14.3803 18.5797 14.3129C18.5932 14.2454 18.5933 14.1759 18.58 14.1085C18.5515 13.973 18.4712 13.854 18.3562 13.7769C18.2412 13.6999 18.1007 13.6708 17.9645 13.696C17.1896 13.8509 16.4311 14.0789 15.6992 14.3769C15.5545 14.4349 15.425 14.5252 15.3206 14.6409C15.2162 14.7567 15.1396 14.8948 15.0968 15.0447L12.8708 22.4562C12.813 22.65 12.8126 22.8563 12.8695 23.0503C12.9265 23.2443 13.0383 23.4177 13.1916 23.5496C13.2518 23.6076 13.3152 23.6622 13.3815 23.7133H13.388C14.4487 24.5775 15.8432 25.2388 17.4146 25.6185C17.4548 25.6314 17.4967 25.638 17.539 25.6381C17.6685 25.6402 17.7941 25.5942 17.8917 25.509C17.9893 25.4238 18.0518 25.3056 18.0673 25.1769C18.0828 25.0484 18.05 24.9186 17.9754 24.8127C17.9008 24.7069 17.7897 24.6324 17.6634 24.6037C16.9569 24.433 16.2702 24.1895 15.6141 23.877C15.5243 23.7928 15.467 23.6798 15.4522 23.5576C15.4375 23.4354 15.4662 23.3119 15.5334 23.2088C15.6005 23.1057 15.7019 23.0295 15.8196 22.9937C15.9373 22.9578 16.0639 22.9646 16.1771 23.0127C17.4211 23.5627 18.9859 23.9096 20.6816 23.9096C22.3774 23.9096 23.9422 23.5627 25.1861 23.0127C25.2994 22.9646 25.426 22.9578 25.5437 22.9937C25.6614 23.0295 25.7628 23.1057 25.8299 23.2088C25.8971 23.3119 25.9259 23.4354 25.9111 23.5576C25.8964 23.6798 25.839 23.7928 25.7492 23.877C25.0931 24.1895 24.4063 24.433 23.6999 24.6037C23.5736 24.6324 23.4624 24.7069 23.3878 24.8127C23.3132 24.9186 23.2806 25.0484 23.296 25.1769C23.3115 25.3056 23.374 25.4238 23.4715 25.509C23.5692 25.5942 23.6948 25.6402 23.8243 25.6381C23.8665 25.638 23.9085 25.6314 23.9487 25.6185C25.5201 25.2388 26.9146 24.5775 27.9753 23.7133H27.9818C28.048 23.6622 28.1115 23.6076 28.1717 23.5496C28.325 23.4177 28.4368 23.2443 28.4938 23.0503C28.5507 22.8563 28.5503 22.65 28.4925 22.4562ZM18.5865 21.5526C18.4311 21.5526 18.2792 21.5066 18.15 21.4202C18.0208 21.3339 17.9201 21.2112 17.8607 21.0677C17.8012 20.9241 17.7856 20.7661 17.816 20.6137C17.8463 20.4613 17.9211 20.3213 18.031 20.2114C18.1408 20.1016 18.2808 20.0267 18.4333 19.9964C18.5857 19.9661 18.7436 19.9817 18.8872 20.0411C19.0308 20.1006 19.1535 20.2013 19.2398 20.3305C19.3261 20.4597 19.3722 20.6116 19.3722 20.767C19.3722 20.9754 19.2894 21.1752 19.1421 21.3225C18.9947 21.4699 18.7949 21.5526 18.5865 21.5526ZM22.7767 21.5526C22.6213 21.5526 22.4695 21.5066 22.3403 21.4202C22.211 21.3339 22.1104 21.2112 22.0509 21.0677C21.9915 20.9241 21.9759 20.7661 22.0062 20.6137C22.0365 20.4613 22.1113 20.3213 22.2212 20.2114C22.331 20.1016 22.4711 20.0267 22.6234 19.9964C22.7759 19.9661 22.9339 19.9817 23.0774 20.0411C23.221 20.1006 23.3437 20.2013 23.43 20.3305C23.5164 20.4597 23.5624 20.6116 23.5624 20.767C23.5624 20.9754 23.4797 21.1752 23.3323 21.3225C23.1849 21.4699 22.9851 21.5526 22.7767 21.5526Z" fill="white" />
      </g>
      <defs>
        <clipPath id="clip0_1510_956">
          <rect width="16.7609" height="16.7609" fill="white" transform="translate(12.3008 11.3384)" />
        </clipPath>
      </defs>
    </svg>

  )
}

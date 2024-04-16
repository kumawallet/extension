import { FC } from "react";

interface LogoAccountFormProps {
  size?: string;
  className?: string;
}

export const LogoAccountForm: FC<LogoAccountFormProps> = ({
  className,
  size = "169"
}) => {
  return (
    <svg width={size} height="60" viewBox="0 0 169 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
<path d="M86.5983 10.8086L86.6642 12.5872C86.7046 13.6754 87.5777 14.5481 88.6659 14.5878L90.4964 14.6547L88.6659 14.7216C87.5777 14.7614 86.7046 15.6341 86.6642 16.7223L86.5983 18.5009L86.5324 16.7223C86.4921 15.6341 85.6189 14.7614 84.5308 14.7216L82.7002 14.6547L84.5308 14.5878C85.6189 14.5481 86.4921 13.6754 86.5324 12.5872L86.5983 10.8086Z" fill="#FDFCF9" fill-opacity="0.71"/>
<path d="M112.918 48.2104L113.009 50.6692C113.065 52.1735 114.272 53.3799 115.776 53.4349L118.307 53.5274L115.776 53.6199C114.272 53.6748 113.065 54.8812 113.009 56.3855L112.918 58.8443L112.827 56.3855C112.771 54.8812 111.564 53.6748 110.06 53.6199L107.529 53.5274L110.06 53.4349C111.564 53.3799 112.771 52.1735 112.827 50.6692L112.918 48.2104Z" fill="#FFFFF8" fill-opacity="0.71"/>
<path d="M157.452 8.92285L157.515 10.6206C157.554 11.6592 158.387 12.4922 159.426 12.5302L161.173 12.594L159.426 12.6579C158.387 12.6959 157.554 13.5289 157.515 14.5675L157.452 16.2652L157.389 14.5675C157.351 13.5289 156.518 12.6959 155.479 12.6579L153.732 12.594L155.479 12.5302C156.518 12.4922 157.351 11.6592 157.389 10.6206L157.452 8.92285Z" fill="white" fill-opacity="0.71"/>
<path d="M73.1532 45.5955C71.9731 45.5955 71.0344 45.2468 70.3371 44.5495C69.6398 43.8253 69.2911 42.9403 69.2911 41.8943V18.6008C69.2911 17.4744 69.6264 16.5223 70.2969 15.7445C70.9942 14.9667 71.9731 14.5778 73.2337 14.5778C74.4674 14.5778 75.3927 14.9667 76.0096 15.7445C76.6533 16.5223 76.9751 17.4878 76.9751 18.6411V30.8309L77.0958 30.8711C77.2299 29.7447 77.5786 28.7121 78.1418 27.7734C78.705 26.8079 79.4962 26.0301 80.5154 25.44C81.5346 24.85 82.7817 24.5549 84.2568 24.5549C86.2415 24.5549 87.8373 25.1048 89.0442 26.2044C90.2512 27.304 90.8546 28.806 90.8546 30.7102C90.8546 32.0244 90.5864 33.0704 90.05 33.8482C89.5404 34.5991 88.8431 35.1221 87.958 35.4172C87.073 35.7122 86.094 35.8463 85.0212 35.8195V36.5034C87.4082 36.5034 89.0979 36.9861 90.0902 37.9517C91.1094 38.8904 91.619 40.0839 91.619 41.5322C91.619 42.8732 91.2167 43.9058 90.4121 44.6299C89.6075 45.3541 88.6419 45.7027 87.5155 45.6759C86.2818 45.6491 85.2626 45.287 84.458 44.5897C83.6534 43.8924 82.9829 42.9537 82.4465 41.7736L80.7166 38.1126C80.3679 37.3885 79.9119 36.8655 79.3487 36.5436C78.8123 36.2218 78.0211 36.1011 76.9751 36.1815V41.8943C76.9751 42.9403 76.6265 43.8253 75.9291 44.5495C75.2586 45.2468 74.3333 45.5955 73.1532 45.5955ZM77.82 33.4459C77.82 33.8214 78.0077 34.103 78.3832 34.2907C78.7855 34.4516 79.6035 34.5321 80.8372 34.5321C82.0442 34.5321 82.8488 34.4516 83.2511 34.2907C83.6534 34.1298 83.8545 33.8482 83.8545 33.4459C83.8545 33.0704 83.6534 32.7888 83.2511 32.601C82.8488 32.4133 82.0576 32.3194 80.8775 32.3194C79.6169 32.3194 78.7855 32.4133 78.3832 32.601C78.0077 32.7888 77.82 33.0704 77.82 33.4459ZM99.6934 45.5955C97.8159 45.5955 96.2872 44.8847 95.1071 43.4632C93.927 42.0418 93.3236 40.0437 93.2967 37.4689L93.2565 28.1757C93.2565 27.0224 93.6052 26.1239 94.3025 25.4802C95.0266 24.8097 96.0056 24.4745 97.2393 24.4745C98.4194 24.4745 99.3715 24.8097 100.096 25.4802C100.82 26.1239 101.182 27.0224 101.182 28.1757V36.5838C101.182 38.5954 101.973 39.6011 103.555 39.6011C104.333 39.6011 104.856 39.3195 105.124 38.7563C105.393 38.1662 105.527 37.4153 105.527 36.5034V28.1757C105.527 27.1297 105.889 26.258 106.613 25.5607C107.337 24.8366 108.276 24.4745 109.429 24.4745C110.636 24.4745 111.561 24.8366 112.205 25.5607C112.876 26.258 113.211 27.1297 113.211 28.1757V41.3713C113.211 42.6586 112.916 43.6912 112.326 44.469C111.762 45.22 110.837 45.5955 109.55 45.5955C108.289 45.5955 107.297 45.22 106.573 44.469C105.875 43.6912 105.527 42.6586 105.527 41.3713V40.6873H104.803C104.803 42.2429 104.333 43.4498 103.395 44.3081C102.483 45.1663 101.249 45.5955 99.6934 45.5955ZM119.078 45.5955C117.872 45.5955 116.906 45.2468 116.182 44.5495C115.485 43.8253 115.136 42.9403 115.136 41.8943V28.578C115.136 27.4515 115.471 26.4994 116.142 25.7216C116.839 24.9438 117.818 24.5549 119.078 24.5549C120.312 24.5549 121.237 24.9438 121.854 25.7216C122.471 26.4994 122.78 27.4784 122.78 28.6585V30.67H123.504C123.504 28.3902 123.987 26.8079 124.952 25.9228C125.918 25.0109 127.111 24.5549 128.533 24.5549C130.356 24.5549 131.697 25.1182 132.556 26.2446C133.414 27.3711 133.843 28.8462 133.843 30.67H134.567C134.567 29.1412 134.822 27.9343 135.332 27.0492C135.841 26.1642 136.485 25.5339 137.263 25.1584C138.067 24.7561 138.899 24.5549 139.757 24.5549C141.5 24.5549 142.774 24.9707 143.579 25.8021C144.41 26.6335 144.947 27.7466 145.188 29.1412C145.429 30.5359 145.55 32.1049 145.55 33.8482V41.8943C145.55 42.9403 145.188 43.8253 144.464 44.5495C143.767 45.2468 142.828 45.5955 141.648 45.5955C140.468 45.5955 139.516 45.2468 138.791 44.5495C138.067 43.8253 137.705 42.9403 137.705 41.8943V34.7735C137.705 33.8079 137.584 33.057 137.343 32.5206C137.102 31.9842 136.619 31.716 135.895 31.716C135.117 31.716 134.607 32.011 134.366 32.601C134.151 33.1911 134.044 33.942 134.044 34.8539V41.8943C134.044 42.9403 133.709 43.8253 133.038 44.5495C132.368 45.2468 131.443 45.5955 130.263 45.5955C129.056 45.5955 128.09 45.2468 127.366 44.5495C126.669 43.8253 126.32 42.9403 126.32 41.8943V34.7735C126.32 33.8079 126.199 33.057 125.958 32.5206C125.716 31.9842 125.247 31.716 124.55 31.716C123.772 31.716 123.276 32.011 123.061 32.601C122.874 33.1911 122.78 33.942 122.78 34.8539V41.8943C122.78 42.9403 122.458 43.8253 121.814 44.5495C121.17 45.2468 120.259 45.5955 119.078 45.5955ZM153.585 45.5955C151.6 45.5955 150.044 45.0591 148.918 43.9862C147.818 42.9134 147.268 41.4115 147.268 39.4804C147.268 37.5494 147.912 36.1547 149.199 35.2965C150.487 34.4114 152.136 33.9689 154.148 33.9689C155.328 33.9689 156.401 34.0493 157.366 34.2102C158.332 34.3712 159.203 34.5991 159.981 34.8942H160.102V34.2907C160.102 33.6738 159.874 33.1911 159.418 32.8424C158.962 32.4669 158.385 32.2926 157.688 32.3194C157.018 32.3194 156.441 32.3597 155.958 32.4401C155.502 32.5206 154.926 32.6547 154.228 32.8424C152.941 33.1643 151.828 33.1374 150.889 32.762C149.95 32.3865 149.307 31.6489 148.958 30.5493C148.636 29.396 148.703 28.4305 149.159 27.6527C149.642 26.8749 150.366 26.2714 151.332 25.8423C152.163 25.44 153.088 25.1048 154.108 24.8366C155.154 24.5684 156.28 24.4343 157.487 24.4343C161 24.4343 163.575 25.2925 165.211 27.009C166.874 28.6987 167.705 31.5416 167.705 35.5379V41.7736C167.705 42.8732 167.37 43.7851 166.7 44.5092C166.029 45.2334 165.104 45.5955 163.924 45.5955C162.636 45.5955 161.671 45.2334 161.027 44.5092C160.41 43.7851 160.102 42.9 160.102 41.854V40.9287H159.297C159.297 41.6261 159.163 42.3368 158.895 43.0609C158.654 43.7851 158.131 44.3885 157.326 44.8713C156.548 45.3541 155.301 45.5955 153.585 45.5955ZM153.987 36.785C153.987 37.2409 154.148 37.5628 154.47 37.7505C154.818 37.9383 155.556 38.0321 156.682 38.0321C157.701 38.0321 158.412 37.9383 158.814 37.7505C159.217 37.5628 159.418 37.2409 159.418 36.785C159.418 36.3559 159.217 36.0608 158.814 35.8999C158.412 35.7122 157.701 35.6183 156.682 35.6183C155.556 35.6183 154.818 35.7122 154.47 35.8999C154.148 36.0608 153.987 36.3559 153.987 36.785Z" fill="#FAFAFA"/>
<g clip-path="url(#clip0_2701_2036)">
<rect width="60" height="60" rx="30" fill="white"/>
<circle cx="30" cy="30" r="30" fill="#6C387A"/>
<path d="M45.3286 54.0571C46.9692 54.0571 48.2996 55.3875 48.2996 57.0281C48.2996 57.8484 47.967 58.5915 47.4295 59.129C46.8914 59.6672 46.1489 59.9998 45.3286 59.9998H28.9396C27.299 59.9998 25.9686 58.6694 25.9686 57.0288C25.9686 56.2085 26.3012 55.466 26.8387 54.9285C27.3762 54.391 28.1193 54.0578 28.9396 54.0578H45.3286V54.0571Z" fill="#FF88AA"/>
<path d="M20.9579 54.8555V58.2069C20.9579 58.7693 20.5021 59.2245 19.9403 59.2245C19.3785 59.2245 18.9227 58.7687 18.9227 58.2069V54.8555C18.9227 54.2937 19.3785 53.8379 19.9403 53.8379C20.2212 53.8379 20.4759 53.9515 20.6604 54.136C20.8442 54.3199 20.9585 54.5739 20.9585 54.8555H20.9579Z" fill="#FF88AA"/>
<path d="M17.513 54.8555V58.2069C17.513 58.7693 17.0572 59.2245 16.4955 59.2245C15.9337 59.2245 15.4779 58.7687 15.4779 58.2069V54.8555C15.4779 54.2937 15.9337 53.8379 16.4955 53.8379C16.7764 53.8379 17.0311 53.9515 17.2156 54.136C17.3994 54.3199 17.5137 54.5739 17.5137 54.8555H17.513Z" fill="#FF88AA"/>
<path d="M59.8738 59.9988H45.3285C46.1488 59.9988 46.8912 59.6662 47.4293 59.128C47.9669 58.5905 48.2994 57.8474 48.2994 57.0271C48.2994 55.3865 46.9691 54.0561 45.3285 54.0561H28.9395C28.1191 54.0561 27.3767 54.3887 26.8386 54.9269C26.3004 55.465 25.9685 56.2068 25.9685 57.0271C25.9685 58.6684 27.2988 59.9981 28.9395 59.9981H0C1.39549 55.9036 4.34925 52.3632 8.12587 50.2546L8.12971 50.2284C12.08 50.8126 20.3546 51.2147 29.9226 51.2147C39.4905 51.2147 47.8034 50.8106 51.7428 50.2246L51.7473 50.2546C55.5246 52.3625 58.4783 55.9036 59.8738 59.9981V59.9988ZM20.9578 58.2068V54.8554C20.9578 54.5745 20.8436 54.3198 20.6597 54.1359C20.4759 53.9514 20.2212 53.8378 19.9396 53.8378C19.3779 53.8378 18.9221 54.2936 18.9221 54.8554V58.2068C18.9221 58.7693 19.3779 59.2244 19.9396 59.2244C20.5014 59.2244 20.9572 58.7686 20.9572 58.2068H20.9578ZM17.5132 58.2068V54.8554C17.5132 54.5745 17.3989 54.3198 17.2151 54.1359C17.0312 53.9514 16.7765 53.8378 16.495 53.8378C15.9326 53.8378 15.4774 54.2936 15.4774 54.8554V58.2068C15.4774 58.7693 15.9332 59.2244 16.495 59.2244C17.0567 59.2244 17.5125 58.7686 17.5125 58.2068H17.5132Z" fill="#D6D6D6"/>
<path d="M55.4485 35.8958C55.3745 35.1444 55.243 34.3905 55.038 33.6596C55.0208 33.6104 55.0049 33.56 54.9908 33.5102C54.9346 33.311 54.8982 33.1061 54.8325 32.9095C54.7482 32.6593 54.6403 32.4135 54.5299 32.1741C54.4227 31.9398 54.3097 31.6947 54.1603 31.4834C54.1405 31.4553 54.1201 31.4285 54.0984 31.4017C54.023 31.3346 53.9458 31.2701 53.866 31.2101C53.6036 30.9165 53.2883 30.6765 52.9046 30.5315C52.4124 30.3458 51.8309 30.3509 51.3482 30.5577C51.2984 30.5641 51.2493 30.5718 51.2001 30.5807C51.082 30.5877 50.9652 30.605 50.8509 30.6305C50.6052 29.9653 50.3134 29.3135 50.0121 28.6828C49.4963 27.6027 48.8931 26.5647 48.2132 25.5797C46.8388 23.5892 45.1669 21.8235 43.2498 20.3488C42.711 19.9345 42.155 19.5477 41.576 19.1908C41.0072 18.8397 40.4212 18.4784 39.7802 18.2741C39.6168 18.2218 39.5038 18.3048 39.4611 18.4229C39.1968 18.2996 38.9319 18.1815 38.6663 18.0686C37.4049 17.5291 36.1 17.1001 34.762 16.7963C32.1242 16.1975 29.3703 16.0781 26.6897 16.4381C21.6063 17.1218 16.8926 19.6562 13.4179 23.4175C11.5456 25.4443 9.89408 27.8682 9.06037 30.5162C9.0559 30.5303 9.05398 30.5437 9.05207 30.5571C8.65181 30.5999 8.24005 30.4505 7.8449 30.4077C7.35846 30.3554 6.87138 30.5028 6.47367 30.7837C5.56016 31.4285 5.26459 32.5431 5.02775 33.5766C4.74431 34.8144 4.54514 36.0714 4.42576 37.3353C4.36703 37.9571 4.31596 38.5827 4.30575 39.2071C4.29745 39.6961 4.34022 40.2131 4.59174 40.6447C5.04754 41.4273 5.94573 41.6157 6.79733 41.6444C6.7986 41.645 6.79924 41.6463 6.80052 41.6469C7.06161 41.8359 7.37314 41.7708 7.58253 41.5639C7.69361 41.7944 7.7051 42.0874 7.74723 42.3338C7.84618 42.9141 7.9713 43.4893 8.12132 44.0581C8.31028 44.7737 8.53881 45.4797 8.80565 46.1711C8.76608 46.1819 8.72713 46.2005 8.69266 46.2317C8.68181 46.2413 8.67287 46.2522 8.66266 46.2624C8.60393 46.1251 8.41688 46.0645 8.27963 46.0849C7.80979 46.1551 7.33803 46.219 6.86883 46.2969C6.51325 46.3556 6.14299 46.445 5.8487 46.6646C5.62399 46.8318 5.48738 47.1433 5.65591 47.3693C5.65591 48.0588 5.65783 49.4447 5.65783 49.4549C5.65783 49.7332 6.54645 49.9969 8.12834 50.2305C12.0786 50.8146 20.3532 51.2168 29.9212 51.2168C39.4891 51.2168 47.8021 50.8127 51.7415 50.2267C53.2263 50.0052 54.0939 49.7588 54.1782 49.4977L54.1826 47.9547C54.1884 47.9407 54.1935 47.926 54.1973 47.91C54.2484 47.7051 54.2682 47.4785 54.1845 47.2927V46.9882C54.1852 47.0418 54.152 47.0948 54.0875 47.1472C54.0728 47.1312 54.0562 47.1165 54.0384 47.1018C54.0332 47.0533 54.0186 47.0023 53.9918 46.9474C53.8424 46.6454 53.3055 46.579 53.0157 46.5011C52.6046 46.3907 52.1877 46.309 51.7664 46.2496C51.7242 46.2439 51.6808 46.2445 51.6387 46.2515C51.5123 46.1877 51.3674 46.1456 51.218 46.1187C51.5621 45.2876 51.8245 44.4213 51.9917 43.5403C52.0932 43.0054 52.1654 42.4634 52.2062 41.9202C52.4922 41.887 52.7731 41.8314 53.0559 41.7746C53.1983 41.7459 53.2825 41.6642 53.3183 41.5633C53.4121 41.5416 53.5053 41.518 53.5985 41.4963C53.6834 41.5608 53.7996 41.5844 53.9432 41.5327C54.8823 41.1969 55.1574 40.2131 55.3113 39.3213C55.5066 38.1908 55.5583 37.0379 55.446 35.8958H55.4485ZM9.03036 46.9499C9.03292 46.8854 9.03547 46.821 9.03802 46.7571C9.03802 46.7507 9.03738 46.745 9.03738 46.7386C9.06803 46.8107 9.09867 46.8829 9.12995 46.9544C9.09675 46.9531 9.06356 46.9525 9.03036 46.9506V46.9499Z" fill="#D6D6D6"/>
<path d="M44.2329 25.5387C47.8442 31.8625 50.2292 38.882 51.2263 46.0957C51.3017 46.6402 51.3693 47.1847 51.4281 47.7312L51.4319 47.7567C47.3782 48.3191 39.2676 48.7022 29.9231 48.7022C20.5786 48.7022 12.5951 48.3249 8.51074 47.7701L8.5133 47.7503C8.57266 47.202 8.64033 46.6549 8.71566 46.1085C9.71152 38.891 12.0978 31.8663 15.711 25.5394C14.837 26.4886 13.0304 26.2448 12.0678 25.3855C10.0154 23.5547 10.9947 20.7739 12.4585 18.915C13.9152 17.0656 16.8613 14.6761 19.1448 16.6902C20.615 17.9874 20.2262 20.0736 19.8496 21.7621C22.9891 20.0857 26.4804 19.252 29.9716 19.2667C33.4629 19.252 36.9548 20.0857 40.0937 21.7621C39.7177 20.0736 39.3283 17.9868 40.7985 16.6902C43.0819 14.6768 46.0287 17.0662 47.4848 18.915C48.948 20.7739 49.9272 23.5547 47.8761 25.3855C46.9135 26.2448 45.1069 26.4886 44.2329 25.5394V25.5387Z" fill="#FFFDF2"/>
<path d="M51.3737 47.7311C51.3143 47.1847 51.2467 46.6395 51.172 46.0956C50.1748 38.882 47.7899 31.8624 44.1786 25.5386C45.0525 26.4879 46.8591 26.244 47.8218 25.3848C49.8735 23.5539 48.8942 20.7732 47.4305 18.9142C45.9743 17.0649 43.0282 14.6754 40.7441 16.6895C39.2739 17.9867 39.6627 20.0729 40.0393 21.7614C38.2717 20.8172 36.3923 20.1405 34.4644 19.7326C32.5174 19.3202 30.4701 20.2491 29.5023 21.9899C28.5435 23.7148 28.5282 26.4068 30.1975 27.7066C31.9786 29.0938 34.467 28.5371 36.453 29.4238C36.6898 29.5298 36.9247 29.6504 37.1105 29.8323C37.2956 30.0136 37.4271 30.2645 37.4131 30.5237C37.3946 30.8563 37.1373 31.1397 36.8347 31.2795C36.5321 31.4194 36.1893 31.4411 35.8561 31.4462C34.744 31.4628 33.5892 31.0389 32.5148 31.1193C31.9179 31.164 31.3702 31.4334 31.1742 32.0277C30.8231 33.0913 31.5834 34.495 32.2722 35.2636C33.1149 36.2046 34.2084 36.8762 35.2254 37.625C37.0249 38.9503 38.7843 41.0799 39.0671 43.3653C39.1718 44.2092 39.0409 45.0978 38.5998 45.8256C38.167 46.5393 37.4635 47.0576 36.7058 47.4068C35.9844 47.7394 35.2228 47.9003 34.4625 48.1103C33.7922 48.2954 32.9789 48.72 32.2856 48.7461C33.1749 48.7123 34.0731 48.6568 34.963 48.7027C35.8242 48.7474 36.7523 48.6312 37.6212 48.6095C39.3825 48.5667 41.1431 48.5074 42.9025 48.4257C45.5606 48.3025 48.2278 48.1544 50.8694 47.8224C51.0392 47.8013 51.2084 47.779 51.3775 47.7554L51.3737 47.7298V47.7311Z" fill="#F4F3E8"/>
<g style={{mixBlendMode : "hard-light"}} opacity="0.42">
<path d="M22.7039 16.5738C21.4304 15.5269 20.0841 14.5265 18.4313 14.2009C16.8079 13.8811 15.0837 14.1052 13.5541 14.7174C10.6699 15.8722 8.41647 18.5132 8.32263 21.7063C8.26645 23.6055 9.02484 25.4306 10.0418 26.9978C10.1867 27.2212 10.5672 27.2691 10.7006 26.9978C11.6052 25.1535 12.9298 23.58 14.3712 22.1328C15.8421 20.6568 17.3582 19.1892 19.3716 18.5106C20.4575 18.1448 21.583 17.8812 22.5795 17.2939C22.6944 17.2262 22.7493 17.1285 22.7601 17.027C22.8591 16.8936 22.8725 16.7117 22.7039 16.5731V16.5738Z" fill="#FFE6FC"/>
</g>
<g style={{mixBlendMode : "hard-light"}} opacity="0.42">
<path d="M50.0456 26.6921C51.0626 25.1243 51.8203 23.2992 51.7648 21.4007C51.6709 18.2075 49.4168 15.5665 46.5333 14.4117C45.0037 13.7995 43.2795 13.5755 41.6561 13.8953C40.0034 14.2209 38.657 15.2212 37.3835 16.2681C37.2468 16.3805 37.2296 16.5209 37.2813 16.6416C37.1243 16.8273 37.1415 17.181 37.4473 17.2831C41.3101 18.5695 44.7644 20.9678 47.3581 24.1023C48.0954 24.9934 48.7536 25.9478 49.337 26.9462C49.5579 27.3254 50.1082 27.0586 50.045 26.6941C50.045 26.6941 50.0456 26.6928 50.0463 26.6921H50.0456Z" fill="#FFE6FC"/>
</g>
<path d="M59.8738 59.999H45.3285C46.1488 59.999 46.8912 59.6664 47.4293 59.1283C47.9669 58.5908 48.2994 57.8477 48.2994 57.0274C48.2994 55.3868 46.9691 54.0564 45.3285 54.0564H28.9395C28.1191 54.0564 27.3767 54.389 26.8386 54.9271C26.3004 55.4653 25.9685 56.2071 25.9685 57.0274C25.9685 58.6686 27.2988 59.9984 28.9395 59.9984H0C1.39549 55.9038 4.34925 52.3634 8.12587 50.2549L8.12971 50.2287C12.08 50.8128 20.3546 51.215 29.9226 51.215C39.4905 51.215 47.8034 50.8109 51.7428 50.2249L51.7473 50.2549C55.5246 52.3628 58.4783 55.9038 59.8738 59.9984V59.999ZM20.9578 58.2071V54.8556C20.9578 54.5747 20.8436 54.32 20.6597 54.1362C20.4759 53.9517 20.2212 53.8381 19.9396 53.8381C19.3779 53.8381 18.9221 54.2939 18.9221 54.8556V58.2071C18.9221 58.7695 19.3779 59.2247 19.9396 59.2247C20.5014 59.2247 20.9572 58.7689 20.9572 58.2071H20.9578ZM17.5132 58.2071V54.8556C17.5132 54.5747 17.3989 54.32 17.2151 54.1362C17.0312 53.9517 16.7765 53.8381 16.495 53.8381C15.9326 53.8381 15.4774 54.2939 15.4774 54.8556V58.2071C15.4774 58.7695 15.9332 59.2247 16.495 59.2247C17.0567 59.2247 17.5125 58.7689 17.5125 58.2071H17.5132Z" fill="#D6D6D6"/>
<path d="M55.4482 35.8961C55.3742 35.1447 55.2427 34.3908 55.0378 33.6599C55.0563 33.6465 55.0729 33.6305 55.0876 33.6126C55.0652 33.4786 55.0499 33.3426 55.0308 33.2079C55.0308 33.2041 55.0295 33.2003 55.0288 33.1964C54.9995 33.07 54.9644 32.9449 54.9222 32.8217C54.8354 32.5683 54.7116 32.327 54.6669 32.0601C54.6662 32.0563 54.6669 32.0525 54.6669 32.0486C54.4486 31.7269 54.1721 31.4403 53.8664 31.2092C53.604 30.9155 53.2886 30.6755 52.905 30.5306C52.4128 30.3448 51.8312 30.3499 51.3486 30.5567C51.2988 30.5631 51.2497 30.5708 51.2005 30.5797C51.0824 30.5868 50.9656 30.604 50.8513 30.6295C50.6055 29.9643 50.3138 29.3126 50.0125 28.6818C49.4967 27.6017 48.8934 26.5637 48.2136 25.5787C46.8391 23.5882 45.1672 21.8225 43.2502 20.3479C42.7114 19.9335 42.1554 19.5467 41.5764 19.1898C41.0076 18.8387 40.4215 18.4774 39.7806 18.2731C39.6172 18.2208 39.5042 18.3038 39.4614 18.4219C39.1971 18.2987 38.9322 18.1806 38.6666 18.0676C37.4052 17.5282 36.1004 17.0992 34.7623 16.7953C32.1246 16.1965 29.3706 16.0771 26.6901 16.4372C21.6067 17.1209 16.893 19.6552 13.4183 23.4165C11.5459 25.4434 9.89445 27.8673 9.06073 30.5153C9.05626 30.5293 9.05435 30.5427 9.05243 30.5561C8.65217 30.5989 8.24042 30.4495 7.84527 30.4067C7.35882 30.3544 6.87174 30.5018 6.47404 30.7827C5.56052 31.4275 5.26495 32.5421 5.02812 33.5756C4.74468 34.8134 4.54551 36.0704 4.42613 37.3344C4.3674 37.9562 4.31633 38.5818 4.30612 39.2061C4.29782 39.6951 4.34059 40.2122 4.59211 40.6437C5.04791 41.4264 5.9461 41.6147 6.79769 41.6434C6.79897 41.644 6.79961 41.6453 6.80088 41.646C7.06198 41.8349 7.37351 41.7698 7.58289 41.563C7.69397 41.7934 7.70546 42.0864 7.74759 42.3328C7.84654 42.9131 7.97166 43.4883 8.12168 44.0571C8.31064 44.7727 8.53918 45.4788 8.80602 46.1701C8.76644 46.181 8.7275 46.1995 8.69303 46.2308C8.68218 46.2403 8.67324 46.2512 8.66302 46.2614C8.60429 46.1242 8.41725 46.0635 8.28 46.0839C7.81016 46.1542 7.3384 46.218 6.86919 46.2959C6.51362 46.3546 6.14336 46.444 5.84907 46.6636C5.62436 46.8308 5.48775 47.1424 5.65628 47.3684C5.65628 48.0578 5.65819 49.4437 5.65819 49.4539C5.65819 49.7323 6.54681 49.9959 8.1287 50.2295C12.079 50.8137 20.3536 51.2158 29.9215 51.2158C39.4895 51.2158 47.8024 50.8117 51.7418 50.2257C53.2267 50.0042 54.0943 49.7578 54.1785 49.4967L54.183 47.9537C54.1887 47.9397 54.1938 47.925 54.1977 47.9091C54.2487 47.7041 54.2685 47.4775 54.1849 47.2917V46.9872C54.1855 47.0409 54.1523 47.0939 54.0879 47.1462C54.0732 47.1302 54.0566 47.1156 54.0387 47.1009C54.0336 47.0524 54.0189 47.0013 53.9921 46.9464C53.8427 46.6444 53.3059 46.578 53.016 46.5002C52.6049 46.3897 52.1881 46.308 51.7667 46.2486C51.7246 46.2429 51.6812 46.2435 51.6391 46.2506C51.5127 46.1867 51.3678 46.1446 51.2184 46.1178C51.5625 45.2866 51.8248 44.4203 51.9921 43.5394C52.0936 43.0044 52.1657 42.4624 52.2066 41.9192C52.4926 41.886 52.7735 41.8304 53.0563 41.7736C53.1986 41.7449 53.2829 41.6632 53.3186 41.5623C53.4125 41.5406 53.5057 41.517 53.5989 41.4953C53.6838 41.5598 53.8 41.5834 53.9436 41.5317C54.8826 41.1959 55.1578 40.2122 55.3116 39.3204C55.507 38.1898 55.5587 37.0369 55.4463 35.8948L55.4482 35.8961ZM9.03009 46.9502C9.03264 46.8857 9.0352 46.8213 9.03775 46.7574C9.03775 46.751 9.03711 46.7453 9.03711 46.7389C9.06775 46.8111 9.0984 46.8832 9.12968 46.9547C9.09648 46.9534 9.06329 46.9528 9.03009 46.9509V46.9502ZM45.3281 35.0081C45.3281 40.8646 40.5805 45.6122 34.724 45.6122H25.0999C19.2435 45.6122 14.4959 40.8646 14.4959 35.0081C14.4959 29.1517 19.2435 24.4041 25.0999 24.4041H34.724C40.5805 24.4041 45.3281 29.1517 45.3281 35.0081Z" fill="#D6D6D6"/>
<path d="M35.8656 33.0815C36.3974 33.0815 36.8283 33.5131 36.8283 34.0448C36.8283 34.5766 36.3967 35.0075 35.8656 35.0075C35.3345 35.0075 34.903 34.576 34.903 34.0448C34.903 33.5137 35.3339 33.0815 35.8656 33.0815Z" fill="black"/>
<path d="M34.621 37.3459C34.8884 38.0385 34.8699 38.8352 34.6031 39.5247C34.2462 40.4471 33.4827 41.1793 32.5954 41.6166C31.7081 42.0539 30.7045 42.2141 29.7151 42.2109C28.7824 42.2077 27.8376 42.059 26.993 41.6619C26.1491 41.2642 25.4099 40.6035 25.0256 39.7532C24.6413 38.9029 24.6451 37.8604 25.1341 37.0656C25.4801 36.5019 26.0387 36.094 26.6394 35.8189C27.602 35.3784 28.7122 35.1109 29.7821 35.116C29.6634 35.116 29.5453 35.1205 29.4284 35.1275H30.137C30.0419 35.1218 29.9462 35.118 29.8504 35.1167C30.9676 35.1237 32.1728 35.4212 33.1412 35.9287C33.7387 36.2415 34.3733 36.7043 34.6216 37.3459H34.621Z" fill="black"/>
<path d="M30.1361 35.1282H29.4275C29.5443 35.1205 29.6624 35.1173 29.7812 35.1167C29.8041 35.1167 29.8271 35.1167 29.8501 35.1167C29.9459 35.118 30.0416 35.1218 30.1367 35.1276L30.1361 35.1282Z" fill="black"/>
<path d="M23.1813 33.0815C23.7131 33.0815 24.144 33.5131 24.144 34.0448C24.144 34.5766 23.7124 35.0075 23.1813 35.0075C22.6502 35.0075 22.2186 34.576 22.2186 34.0448C22.2186 33.5137 22.6495 33.0815 23.1813 33.0815Z" fill="black"/>
<path d="M51.2264 46.1426C52.9876 46.3864 54.1871 46.6929 54.1871 46.9878C54.1871 47.2827 53.1919 47.5598 51.4319 47.8036C47.3782 48.366 39.2677 48.7491 29.9231 48.7491C20.5786 48.7491 12.5951 48.3718 8.51077 47.817C6.6914 47.57 5.65979 47.2872 5.65979 46.9878C5.65979 46.6884 6.73609 46.3935 8.62887 46.1426" stroke="black" stroke-width="0.162461" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M5.65933 46.9873C5.65487 47.0013 5.65933 49.4393 5.65933 49.454C5.65933 49.7323 6.54795 49.996 8.12985 50.2296C12.0801 50.8137 20.3547 51.2159 29.9227 51.2159C39.4907 51.2159 47.8036 50.8118 51.743 50.2258C53.2278 50.0043 54.0954 49.7572 54.1797 49.4968L54.1867 46.9879" stroke="black" stroke-width="0.162461" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8.79761 49.2446C10.1567 49.4189 11.9129 49.5747 13.9761 49.7049" stroke="black" stroke-width="0.162461" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M19.613 49.9725C22.7424 50.0791 26.2368 50.1391 29.9228 50.1391C34.4214 50.1391 38.6341 50.0504 42.2453 49.8953" stroke="black" stroke-width="0.162461" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M44.2188 49.8013C46.9982 49.6539 49.3296 49.4649 51.0372 49.2466" stroke="black" stroke-width="0.162461" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M28.9401 59.9996H0C1.39549 55.9051 4.34925 52.3647 8.12587 50.2561" stroke="black" stroke-width="0.162461" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M51.7472 50.2561C55.5245 52.364 58.4783 55.9051 59.8737 59.9996H45.3284" stroke="black" stroke-width="0.162461" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M45.3286 59.9996H28.9396C27.299 59.9996 25.9686 58.6692 25.9686 57.0286C25.9686 56.2083 26.3012 55.4659 26.8387 54.9284C27.3762 54.3908 28.1193 54.0576 28.9396 54.0576H45.3286C46.9692 54.0576 48.2996 55.388 48.2996 57.0286C48.2996 57.8489 47.967 58.592 47.4295 59.1295C46.8914 59.6677 46.1489 60.0003 45.3286 60.0003V59.9996Z" stroke="black" stroke-width="0.162461" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M19.9403 59.2247C19.3785 59.2247 18.9227 58.7689 18.9227 58.2072V54.8557C18.9227 54.2939 19.3785 53.8381 19.9403 53.8381C20.2212 53.8381 20.4759 53.9518 20.6604 54.1363C20.8442 54.3201 20.9585 54.5742 20.9585 54.8557V58.2072C20.9585 58.7696 20.5027 59.2247 19.9409 59.2247H19.9403Z" stroke="black" stroke-width="0.162461" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M16.4955 59.2247C15.9331 59.2247 15.4779 58.7689 15.4779 58.2072V54.8557C15.4779 54.2939 15.9337 53.8381 16.4955 53.8381C16.7764 53.8381 17.0311 53.9518 17.2156 54.1363C17.3994 54.3201 17.5137 54.5742 17.5137 54.8557V58.2072C17.5137 58.7696 17.0579 59.2247 16.4961 59.2247H16.4955Z" stroke="black" stroke-width="0.162461" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M29.7809 38.4765C31.3547 38.4765 32.6306 37.9366 32.6306 37.2706C32.6306 36.6046 31.3547 36.0647 29.7809 36.0647C28.207 36.0647 26.9312 36.6046 26.9312 37.2706C26.9312 37.9366 28.207 38.4765 29.7809 38.4765Z" fill="#252525"/>
<path d="M23.2056 33.5973C23.2056 33.5405 23.1909 33.4875 23.1621 33.4377C23.1455 33.4167 23.1289 33.395 23.113 33.3739C23.0734 33.3349 23.0274 33.3075 22.9738 33.2928C22.9381 33.2813 22.8998 33.2769 22.8621 33.2769C22.8442 33.2769 22.8225 33.2813 22.8072 33.2832C22.7861 33.2858 22.7695 33.2864 22.7504 33.2928C22.6591 33.3222 22.5761 33.3809 22.5308 33.4671C22.5008 33.5239 22.4829 33.5794 22.4829 33.6446C22.4829 33.6478 22.4829 33.6509 22.4829 33.6541C22.4867 33.6822 22.4906 33.7103 22.4944 33.7378C22.5021 33.7678 22.5136 33.7978 22.5295 33.8246C22.5384 33.8393 22.5474 33.8488 22.5595 33.8648C22.5927 33.9076 22.5978 33.9159 22.6534 33.951C22.6565 33.9529 22.6597 33.9548 22.6629 33.9567C22.6878 33.9676 22.7134 33.9778 22.7383 33.9886C22.7408 33.9893 22.7427 33.9906 22.7453 33.9912C22.7606 33.9944 22.7759 33.9963 22.7912 33.9976C22.8066 34.0001 22.8219 34.002 22.8372 34.0033C22.841 34.0033 22.8449 34.0033 22.8487 34.0033C22.9145 33.9982 22.9642 33.9899 23.0223 33.9554C23.0728 33.9254 23.1187 33.8827 23.1487 33.8316C23.1577 33.8163 23.1615 33.8042 23.1692 33.785C23.1902 33.7346 23.1973 33.7212 23.1985 33.6554C23.1985 33.6516 23.1985 33.6484 23.1985 33.6446C23.2004 33.6286 23.203 33.6126 23.2049 33.5967L23.2056 33.5973Z" fill="#252525"/>
<path d="M35.9131 33.6383C35.9131 33.5815 35.8984 33.5285 35.8697 33.4787C35.8531 33.4577 35.8365 33.436 35.8205 33.4149C35.7809 33.376 35.735 33.3485 35.6813 33.3338C35.6456 33.3223 35.6073 33.3179 35.5696 33.3179C35.5518 33.3179 35.53 33.3223 35.5147 33.3243C35.4937 33.3268 35.4771 33.3274 35.4579 33.3338C35.3666 33.3632 35.2836 33.4219 35.2383 33.5081C35.2083 33.5649 35.1904 33.6205 35.1904 33.6856C35.1904 33.6888 35.1904 33.692 35.1904 33.6951C35.1943 33.7232 35.1981 33.7513 35.2019 33.7788C35.2096 33.8088 35.2211 33.8388 35.237 33.8656C35.246 33.8803 35.2549 33.8899 35.267 33.9058C35.3002 33.9486 35.3053 33.9569 35.3609 33.992C35.3641 33.9939 35.3673 33.9958 35.3705 33.9977C35.3953 34.0086 35.4209 34.0188 35.4458 34.0297C35.4483 34.0303 35.4502 34.0316 35.4528 34.0322C35.4681 34.0354 35.4834 34.0373 35.4988 34.0386C35.5141 34.0411 35.5294 34.0431 35.5447 34.0443C35.5486 34.0443 35.5524 34.0443 35.5562 34.0443C35.622 34.0392 35.6718 34.0309 35.7299 33.9965C35.7803 33.9665 35.8263 33.9237 35.8563 33.8726C35.8652 33.8573 35.869 33.8452 35.8767 33.826C35.8977 33.7756 35.9048 33.7622 35.906 33.6964C35.906 33.6926 35.906 33.6894 35.906 33.6856C35.908 33.6696 35.9105 33.6537 35.9124 33.6377L35.9131 33.6383Z" fill="#252525"/>
<path d="M10.3026 27.4757C7.51227 24.2678 7.64377 19.4009 10.6952 16.3488C13.8839 13.1601 19.0541 13.1601 22.2434 16.3488C22.2479 16.3533 22.2523 16.3577 22.2568 16.3622L22.929 16.9801" stroke="black" stroke-width="0.162461" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M36.9629 17.0947L37.6683 16.305C37.6721 16.3006 37.6766 16.2967 37.6804 16.2923C40.7861 13.0225 45.9544 12.8891 49.2248 15.9948C52.4607 19.0679 52.6248 24.1615 49.618 27.4364" stroke="black" stroke-width="0.162461" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9.46867 47.7363C8.64134 45.9093 8.05148 43.9514 7.73804 41.9028" stroke="black" stroke-width="0.162461" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8.96484 30.4197C12.204 21.9893 20.3771 16.0059 29.9482 16.0059C39.5194 16.0059 47.7365 22.0219 50.9578 30.4887" stroke="black" stroke-width="0.162461" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M52.1515 41.9565C51.8546 43.8672 51.1875 46.1436 50.4413 47.8628" stroke="black" stroke-width="0.162461" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8.47093 36.1801C8.88911 33.0585 8.33067 30.4078 7.22363 30.2595C6.1166 30.1112 4.88017 32.5215 4.462 35.6431C4.04383 38.7646 4.60227 41.4154 5.7093 41.5637C6.81634 41.712 8.05276 39.3017 8.47093 36.1801Z" stroke="black" stroke-width="0.162461" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M7.22283 30.2551C7.25283 30.2551 9.21648 30.5711 9.24584 30.575C10.3528 30.7231 10.9114 33.3742 10.4939 36.4959C10.0757 39.6175 8.83983 42.028 7.73225 41.8799C7.64799 41.8684 5.68945 41.5793 5.61157 41.5403" stroke="black" stroke-width="0.162461" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M54.1914 41.5545C55.2984 41.4062 55.8569 38.7554 55.4387 35.6339C55.0205 32.5123 53.7841 30.102 52.6771 30.2503C51.57 30.3986 51.0116 33.0493 51.4298 36.1709C51.8479 39.2925 53.0844 41.7028 54.1914 41.5545Z" stroke="black" stroke-width="0.162461" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M52.6746 30.2551C52.6446 30.2551 50.681 30.5711 50.6516 30.575C49.5447 30.7231 48.9861 33.3742 49.4036 36.4959C49.8217 39.6175 51.0576 42.028 52.1652 41.8799C52.2495 41.8684 54.208 41.5793 54.2859 41.5403" stroke="black" stroke-width="0.162461" stroke-linecap="round" stroke-linejoin="round"/>
<g style={{mixBlendMode : "hard-light"}} opacity="0.16">
<path d="M34.7253 24.4043H25.1011C19.2447 24.4043 14.4971 29.1519 14.4971 35.0083C14.4971 40.8648 19.2447 45.6124 25.1011 45.6124H34.7253C40.5817 45.6124 45.3293 40.8648 45.3293 35.0083C45.3293 29.1519 40.5817 24.4043 34.7253 24.4043Z" fill="#FFE6FC"/>
</g>
<g style={{mixBlendMode : "hard-light"}} opacity="0.35">
<path d="M35.6341 24.3825C35.6213 24.3812 35.6085 24.3806 35.5945 24.3806H29.7482C29.6735 24.3582 29.5937 24.3582 29.5235 24.3889C29.3639 24.4214 29.272 24.5447 29.2471 24.6832C28.88 25.1683 28.5909 25.7327 28.2742 26.2459C27.9174 26.8243 27.5612 27.4027 27.2043 27.9804C26.4689 29.1729 25.7367 30.3679 25.0038 31.5617C23.5266 33.9677 22.0533 36.3763 20.5793 38.7849L19.3491 40.7945C18.9297 41.4795 18.4675 42.1536 18.1145 42.8756C17.9753 43.1609 18.2632 43.3754 18.4905 43.2669C18.8786 43.8063 19.5413 44.0559 20.1445 44.3432C20.9974 44.7492 21.8547 45.2523 22.8148 45.3231C22.97 45.3346 23.0753 45.2657 23.1321 45.1654C23.1985 45.1405 23.2604 45.0965 23.3109 45.0282C23.7852 44.3911 24.3016 43.7834 24.7325 43.1214C25.0338 42.5194 25.4915 41.9544 25.8586 41.3901C26.2257 40.8258 26.5851 40.204 26.9522 39.6135C27.6914 38.4229 28.4313 37.233 29.1705 36.0424C30.6605 33.644 32.1517 31.2457 33.634 28.8422C34.0464 28.1738 34.4588 27.5048 34.8712 26.8364C35.281 26.1719 35.779 25.5092 36.079 24.7872C36.1882 24.5255 35.8639 24.3008 35.6334 24.3825H35.6341Z" fill="white"/>
</g>
<g style={{mixBlendMode : "hard-light"}} opacity="0.35">
<path d="M36.3947 45.4082C37.2029 45.2882 37.9995 45.0737 38.7592 44.7737C39.5131 44.4762 40.2154 44.0848 40.8595 43.5933C41.4768 43.1222 42.0456 42.5866 42.555 42.0006C43.5675 40.8368 44.3476 39.4637 44.7887 37.9833C45.0057 37.2549 45.1398 36.501 45.1787 35.7419C45.2208 34.9133 45.1366 34.0917 44.9821 33.2778C44.8914 32.7984 44.7791 32.3234 44.6623 31.8498C44.6048 31.618 44.5403 31.3869 44.4886 31.1539C44.4446 30.956 44.4114 30.7549 44.3616 30.5583C44.308 30.3464 44.2333 30.1402 44.112 29.957C43.9913 29.7744 43.8509 29.6052 43.7041 29.4424C43.6849 29.4214 43.6651 29.4009 43.6453 29.3799C43.5738 29.5025 43.5017 29.6244 43.4283 29.7438C43.0714 30.3221 42.7152 30.9005 42.3584 31.4782C41.623 32.6707 40.8908 33.8657 40.1579 35.0595C38.6807 37.4655 37.2073 39.8741 35.7333 42.2827L34.5032 44.2923C34.2574 44.6939 33.9969 45.0916 33.7524 45.4976C34.6321 45.4248 35.5156 45.5391 36.3928 45.4088L36.3947 45.4082Z" fill="white"/>
</g>
<path d="M54.1857 46.9756C54.1857 46.9794 54.1863 46.9832 54.1863 46.9877C54.1863 47.282 53.1911 47.5597 51.4311 47.8036C47.3774 48.366 39.2668 48.749 29.9223 48.749C20.5778 48.749 12.5942 48.3717 8.50992 47.817C6.69055 47.5699 5.65894 47.2871 5.65894 46.9877C5.65894 46.9852 5.65894 46.9826 5.65894 46.9794" stroke="black" stroke-width="0.162461" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M34.725 24.4043H25.1009C19.2444 24.4043 14.4968 29.1519 14.4968 35.0083C14.4968 40.8648 19.2444 45.6124 25.1009 45.6124H34.725C40.5815 45.6124 45.3291 40.8648 45.3291 35.0083C45.3291 29.1519 40.5815 24.4043 34.725 24.4043Z" stroke="black" stroke-width="0.162461" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<defs>
<clipPath id="clip0_2701_2036">
<rect width="60" height="60" rx="30" fill="white"/>
</clipPath>
</defs>
</svg>

  );
};
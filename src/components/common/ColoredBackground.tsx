import BG1 from '/assets/bg-1.svg'
import BG2 from "/assets/bg-2.svg";
import STAR from "/assets/star.svg";

export const ColoredBackground = () => (
  <>
    <img src={BG1} alt="" width={200} className='absolute top-0 right-0' />
    <img src={STAR} alt="" width={32} className='absolute top-3 right-3' />


    <img src={BG2} alt="" width={280} className='absolute bottom-0 left-0 z-0' />

  </>
)
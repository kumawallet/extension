import { BsArrowUpRight, BsArrowDownLeft } from "react-icons/bs";

export const TotalBalance = () => {
  return (
    <div className="mx-auto">
      <p className="text-lg mb-6">Total Account Balance</p>
      <div className="flex mb-8">
        <p>simbol</p>
        <p className="text-5xl">1.26</p>
      </div>
      <div className="flex gap-3 justify-center">
        <button className="flex gap-1 items-center text-custom-green-bg font-bold text-lg">
          <BsArrowUpRight />
          <p>Send</p>
        </button>
        <button className="flex gap-1 items-center text-custom-green-bg font-bold text-lg">
          <BsArrowDownLeft />
          <p>Receive</p>
        </button>
      </div>
    </div>
  );
};

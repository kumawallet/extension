import { BsArrowUpRight, BsArrowDownLeft } from "react-icons/bs";

export const TotalBalance = ({ balance = 0 }: { balance: number }) => {
  return (
    <div className="mx-auto">
      <p className="text-lg mb-6">Total Account Balance</p>
      <div className="flex mb-8 gap-2 items-center justify-center">
        <p className="text-2xl">$</p>
        <p className="text-5xl">{balance}</p>
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

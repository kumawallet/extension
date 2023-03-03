import { Account } from "./Account";
import { ChainSelector } from "./ChainSelector";

export const Header = () => {
  return (
    <header className="flex justify-between px-3 bg-[#343A40] py-1 relative items-center max-w-3xl w-full mx-auto">
      <ChainSelector />
      <Account />
    </header>
  );
};

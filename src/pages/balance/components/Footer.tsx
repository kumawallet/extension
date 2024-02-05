import {
  FullScreenFAB,
} from "@src/components/common";
import { Settings } from "./Settings";
import { SignOut } from "./SignOut";

export const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 py-2 rounded-lg bg-[#343A40] px-2 flex justify-evenly max-w-3xl w-full mx-auto">
      <SignOut />
      <FullScreenFAB />
      <Settings />
    </footer>
  );
};

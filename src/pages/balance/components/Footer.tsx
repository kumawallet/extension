import {
  FullScreenFAB,
} from "@src/components/common";
import { ButtonSettings } from "./SettingsButton"
import { SignOut } from "./SignOut";

export const Footer = () => {
  return (
    <footer className=" fixed items-center bottom-0 left-0 right-0 py-1 rounded-lg bg-[#343A40] px-2 flex justify-evenly max-w-[357px] w-full mx-auto">
      <SignOut />
      <FullScreenFAB />
      <ButtonSettings />
    </footer>
  );
};

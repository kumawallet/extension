import { DecryptFAB, FullScreenFAB } from "@src/components/common";
import { Settings } from "./Settings";

const isDevelop = (process.env.NODE_ENV = "develop");

export const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 py-2 bg-[#343A40] px-2 flex justify-end gap-4 max-w-3xl w-full mx-auto">
      <FullScreenFAB />
      {isDevelop && <DecryptFAB />}
      <Settings />
    </footer>
  );
};

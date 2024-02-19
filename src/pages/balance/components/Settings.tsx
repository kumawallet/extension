import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { BsChevronRight, BsGear } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  SETTINGS_GENERAL,
  SETTINGS_CONTACTS,
  SETTINGS_SECURITY,
  SETTINGS_BUG,
  SETTINGS_ABOUT_US,
} from "@src/routes/paths";
import { ICON_SIZE } from "@src/constants/icons";
import { RxCross2 } from "react-icons/rx";
import { useThemeContext } from "@src/providers";
import { FooterIcon } from "./FooterIcon";
import { version } from "@src/utils/env";


const OPTIONS = [
  {
    text: "general",
    href: SETTINGS_GENERAL,
  },
  {
    text: "contacts",
    href: SETTINGS_CONTACTS,
  },
  {
    text: "security",
    href: SETTINGS_SECURITY,
  },
  {
    text: "bug_report",
    href: SETTINGS_BUG,
  },
  {
    text: "about_us",
    href: SETTINGS_ABOUT_US,
  },
];

export const Settings = () => {
  const { t } = useTranslation("settings");
  const { color } = useThemeContext();
  const navigate = useNavigate()


  return (
    <Menu>
      {({ close }) => (
        <>
          <Menu.Button as={Fragment}>
            <FooterIcon icon={BsGear} />
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="right-0 absolute origin-bottom-right max-w-lg  bottom-12 w-full h-[calc(100vh-99px)] bg-[#29323C] ring-0 outline-0 rounded-xl z-50">
              <div className="h-full flex flex-col overflow-auto settings-container">
                <div className="text-start px-4 pt-8 flex-1">
                  <div>
                    <div className="flex items-center justify-between pb-6">
                      <p className="text-2xl font-medium">{t("title")}</p>
                      <RxCross2
                        className="cursor-pointer"
                        size={ICON_SIZE}
                        onClick={close}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      {OPTIONS.map((opt) => (
                        <div
                          key={opt.text}
                          onClick={() => navigate(opt.href)}
                          className={`flex justify-between items-center hover:bg-${color}-primary hover:bg-opacity-40 rounded-xl px-3 py-3 cursor-pointer`}
                        >
                          <p className="text-xl">{t(opt.text)}</p>
                          <BsChevronRight />
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
                <p className="text-center text-sm text-gray-400">
                  {version}
                </p>
              </div>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
};

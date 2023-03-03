import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { BsBoxArrowInRight, BsChevronRight, BsGear } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import Extension from "@src/Extension";
import { useTranslation } from "react-i18next";
import {
  SETTINGS_GENERAL,
  // SETTINGS_ADVANCED,
  // SETTINGS_CONTACTS,
  // SETTINGS_SECURITY,
  // SETTINGS_BUG,
  SIGNIN,
} from "@src/routes/paths";
import { ICON_SIZE } from "@src/constants/icons";

const OPTIONS = [
  {
    text: "general",
    href: SETTINGS_GENERAL,
  },
  // {
  //   text: "advanced",
  //   href: SETTINGS_ADVANCED,
  // },
  // {
  //   text: "contacts",
  //   href: SETTINGS_CONTACTS,
  // },
  // {
  //   text: "security",
  //   href: SETTINGS_SECURITY,
  // },
  // {
  //   text: "bug_report",
  //   href: SETTINGS_BUG,
  // },
];

export const Settings = () => {
  const { t } = useTranslation("settings");

  const navigate = useNavigate();

  const signOut = async () => {
    await Extension.signOut();
    navigate(SIGNIN);
  };

  return (
    <Menu>
      <Menu.Button>
        <div className="flex justify-center items-center rounded-full bg-[#212529] p-2 cursor-pointer">
          <BsGear color="#469999" />
        </div>
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
          <div className="text-start px-4 py-10">
            <div className="mb-2">
              <p className="pb-6 text-2xl font-medium">{t("title")}</p>
            </div>
            <div className="flex flex-col gap-1">
              {OPTIONS.map((opt) => (
                <div
                  key={opt.text}
                  onClick={() => navigate(opt.href)}
                  className="flex justify-between items-center hover:bg-custom-green-bg hover:bg-opacity-40 rounded-xl px-3 py-3 cursor-pointer"
                >
                  <p className="text-xl">{t(opt.text)}</p>
                  <BsChevronRight />
                </div>
              ))}
            </div>
            <div className="mt-10 flex justify-end">
              <div className="flex cursor-pointer hover:bg-gray-400 hover:bg-opacity-30 rounded-xl px-3 py-3">
                <p className="text-lg pr-3">{t("sign_out")}</p>
                <BsBoxArrowInRight size={ICON_SIZE} onClick={() => signOut()} />
              </div>
            </div>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

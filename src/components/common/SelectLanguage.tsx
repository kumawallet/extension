import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { LANGUAGES } from "@src/utils/constants";
import { TbLanguage } from "react-icons/tb";
import { useTranslation } from "react-i18next";

export const SelectLanguage = () => {
  const { i18n } = useTranslation();

  const changeLanguge = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem("language", language);
  };

  return (
    <div className="flex justify-end">
      <div className="py-2 pr-1  text-right">
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button className="inline-flex w-full justify-center rounded-md bg-black bg-opacity-20 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
              <TbLanguage size={24} />
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute top-10 right-0 mt-1 w-32 overflow-auto rounded-md bg-[#212529] py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
              {LANGUAGES.map((language, index) => (
                <Menu.Item key={index}>
                  <button
                    onClick={() => changeLanguge(language.lang)}
                    className="px-2 w-full hover:bg-gray-400 hover:bg-opacity-50 cursor-pointer rounded-md flex items-center gap-2 py-2 whitespace-nowrap"
                  >
                    {`${language.flag}  ${language.englishName}`}
                  </button>
                </Menu.Item>
              ))}
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  );
};

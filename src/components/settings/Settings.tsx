import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { BsGear } from "react-icons/bs";
import { BsChevronRight } from "react-icons/bs";

const OPTIONS = [
  {
    text: "general",
    href: "/settings-general",
  },
  {
    text: "advanced",
    href: "/settings-advanced",
  },
  {
    text: "contacts",
    href: "/settings-contacts",
  },
  {
    text: "security",
    href: "/settings-security",
  },
  {
    text: "bug report",
    href: "/settings-bug",
  },
];

export const Settings = () => {
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
        <Menu.Items className="right-0 absolute origin-bottom-right max-w-lg  bottom-12 w-full h-[calc(100vh-99px)] bg-[#29323C] ring-0 outline-0 rounded-xl">
          <div className="text-start px-4 py-10">
            <div className="mb-10">
              <p className="pb-6 text-2xl font-medium">Settings</p>
            </div>
            <div className="flex flex-col gap-1">
              {OPTIONS.map((opt) => (
                <div
                  key={opt.text}
                  className="flex justify-between items-center hover:bg-custom-green-bg hover:bg-opacity-40 rounded-xl px-3 py-3"
                >
                  <p className="capitalize text-xl">{opt.text}</p>
                  <BsChevronRight />
                </div>
              ))}
            </div>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

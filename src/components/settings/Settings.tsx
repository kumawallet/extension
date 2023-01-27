import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { BsGear } from "react-icons/bs";
import { RxCross2 } from "react-icons/rx";
import { BsChevronRight } from "react-icons/bs";

const OPTIONS = [
  {
    text: "general",
    href: "#",
  },
  {
    text: "advanced",
    href: "#",
  },
  {
    text: "contacts",
    href: "",
  },
  {
    text: "security",
    href: "",
  },
  {
    text: "bug report",
    href: "",
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
        <Menu.Items className="right-0 absolute origin-bottom-right max-w-lg  bottom-12 w-full h-[calc(100vh-48px)] bg-[#29323C] ring-0 outline-0">
          <div className="text-start px-3 py-10">
            <div className="flex justify-between mb-20">
              <p className="pb-6 text-xl">Settings</p>
              <RxCross2 />
            </div>
            <div className="flex flex-col gap-5">
              {OPTIONS.map((opt) => (
                <div
                  key={opt.text}
                  className="flex justify-between items-center"
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

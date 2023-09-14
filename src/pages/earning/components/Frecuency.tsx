import { Listbox, Switch, Transition } from "@headlessui/react";
import { useThemeContext } from "@src/providers";
import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import { NumericFormat } from "react-number-format";
import { BiChevronDown } from "react-icons/bi"

const FRECUENCIES = [
  {
    label: "Daily",
    value: "daily",
  },
  {
    label: "Weekly",
    value: "weekly",
  },
  {
    label: "Monthly",
    value: "monthly",
  },
];

const DEFAULT_DAYS_BY_FRECUENCY = ["7", "15", "30"]

const HOURS = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24
]

export const Frecuency = () => {
  const { t } = useTranslation("swap");
  const { color } = useThemeContext();

  const [frecuency, setFrecuency] = useState({
    frecuency: FRECUENCIES[0].value,
    howManyDays: "",
    selectedDayManually: false,
    hour: HOURS[9],
  });

  const selectedDayManually = (day: string, isManually: boolean) => setFrecuency({ ...frecuency, howManyDays: day, selectedDayManually: isManually })


  return (
    <>
      <p className="font-inter font-bold text-lg mb-1">
        {t("choose_frecuency")}
      </p>
      <div className="flex flex-wrap gap-5">
        {FRECUENCIES.map(({ label, value }) => {
          const isSelected = frecuency.frecuency === value;
          return (
            <div key={value} className="flex items-center">
              <Switch.Group>
                <Switch
                  checked={isSelected}
                  onChange={() =>
                    setFrecuency({ ...frecuency, frecuency: value })
                  }
                  className={`${isSelected ? `bg-${color}-primary` : "bg-custom-gray-bg"
                    } relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200`}
                >
                  <span className="sr-only">{label}</span>
                  <span
                    className={`${isSelected ? "translate-x-6" : "translate-x-1"
                      } inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200`}
                  />
                </Switch>
                <Switch.Label className="ml-1 text-[#667080]">
                  {label}
                </Switch.Label>
              </Switch.Group>
            </div>
          );
        })}
      </div>

      <p className="font-inter font-bold text-lg mb-1 mt-4">
        {t("how_many_days")}
      </p>
      <div
        className="grid grid-cols-7 gap-1"
      >
        <NumericFormat
          className={`input-secondary py-2 rounded-2xl pr-12 outline outline-transparent focus:outline-${color}-primary hover:outline-${color}-primary col-start-1 col-span-4`}
          allowNegative={false}
          allowLeadingZeros={false}
          value={!frecuency.selectedDayManually ? frecuency.howManyDays : ""}
          onValueChange={({ value }) => {
            selectedDayManually(value, false)
          }}
          placeholder={t("custom")}
          allowedDecimalSeparators={["%"]}
        />
        {
          DEFAULT_DAYS_BY_FRECUENCY.map((day) => (
            <button
              key={day}
              onClick={() => selectedDayManually(day, true)}
              className={`${frecuency.selectedDayManually && frecuency.howManyDays === day ? `bg-${color}-fill text-${color}-secondary` : "bg-[#212529]"} hover:bg-${color}-fill hover:text-${color}-secondary rounded-xl py-2 px-3 text-[#A3A3A3] text-lg`}
            >{day}</button>
          ))
        }
      </div>

      <p className="font-inter font-bold text-lg mb-1 mt-4">
        {t("especify_hour")}
      </p>

      <div className="">
        <Listbox value={frecuency.hour} onChange={(value) => setFrecuency(frecuency => ({ ...frecuency, hour: value }))}>
          <div className="relative mt-1">
            <Listbox.Button className={`input-secondary py-3 rounded-2xl pr-12 outline outline-transparent focus:outline-${color}-primary hover:outline-${color}-primary col-start-1 col-span-4`}
            >
              <span className="block truncate text-start">{frecuency.hour} UTC</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <BiChevronDown
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute mt-1 top-10 max-h-60 w-full overflow-auto rounded-md bg-[#212529] py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
                {HOURS.map((hour, personIdx) => (
                  <Listbox.Option
                    key={personIdx}
                    className="px-2 hover:bg-gray-400 hover:bg-opacity-50 cursor-pointer rounded-md flex items-center gap-2 py-2"
                    value={hour}
                  >
                    {({ selected }) => (
                      <>
                        <span>
                          {hour} UTC
                        </span>
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox >
      </div >
    </>
  );
};

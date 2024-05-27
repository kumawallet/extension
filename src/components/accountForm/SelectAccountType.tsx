import { AccountType } from "@src/accounts/types";
import { FC, useEffect, useState } from "react";

interface AccountOption {
  logo: string;
  label: string;
  value: AccountType
}

interface SelectAccountTypeProps {
  type: "create" | "import";
  options: AccountOption[];
  onChangeOptions: (values: string[]) => void;
  containerClassname?: string;
}

export const SelectAccountType: FC<SelectAccountTypeProps> = ({
  options,
  type,
  containerClassname = "",
  onChangeOptions
}) => {
  const [optionSelected, setOptionSelected] = useState(
    options.map((option) => ({ ...option, checked: false }))
  );

  const title =
    type === "create"
      ? "Select accounts to create"
      : "Select accounts to import";

  const onToggleOption = (index: number) => {
    setOptionSelected((prev) => {
      const newOptions = [...prev];
      newOptions[index].checked = !newOptions[index].checked;
      return newOptions;
    });
  };

  useEffect(() => {
    onChangeOptions(optionSelected.filter((option) => option.checked).map((option) => option.value));
  }, [optionSelected]);

  return (
    <div className={containerClassname}>
      {title && <h3 className="mb-3 text-xl">{title}</h3>}
      <ul>
        {optionSelected.map((option, index) => (
          <li key={index} className="w-full py-1">
            <div className="flex items-center">
              <input
                id={`${option.label}-checkbox`}
                type="checkbox"
                checked={option.checked}
                onChange={() => onToggleOption(index)}
                className="w-3 h-3 bg-transparent border border-gray-300 rounded-sm checked:bg-[#12B28C] checked:border-[#12B28C]"
              />
              <label
                htmlFor={`${option.label}-checkbox`}
                className="w-full ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                <div className="flex items-center gap-1">
                  <img width={18} src={option.logo} alt={option.label} className="rounded-full" />
                  <span>{option.label}</span>
                </div>
              </label>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

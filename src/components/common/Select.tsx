import { FC } from "react";


type IconField<T> = keyof T;
type LabelField<T> = keyof T;

interface SelectProps<T> {
  containerClassname: string;
  buttonClassname?: string;
  onChangeValue: (value: T) => void;
  value: T | null;
  items: T[];
  labelField: LabelField<T>;
  iconField: IconField<T>;
  iconWidth?: number;
  selectedLabelClassName?: string;
  selectedItemContainerClassName?: string;
  modalTitle?: string;
}

export const Select = <T,>({
  containerClassname,

}: SelectProps<T>) => {
  return (
    <div className={containerClassname}>

    </div>
  )
}

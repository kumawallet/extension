import { CSSProperties, FC, HTMLAttributes } from "react";
import { RecordStatus}from "@src/storage/entities/activity/types"
import { FaCircleCheck } from "react-icons/fa6";
import { IoIosCloseCircle } from "react-icons/io";
import {  PiWarningOctagonFill  } from "react-icons/pi";


interface statusProps {
    status: RecordStatus;
    classname?: HTMLAttributes<HTMLButtonElement>["className"];
    isDisabled?: boolean;
    onClick?: () => void;
    style?: CSSProperties;
}

const chipColor = {
    [RecordStatus.FAIL]: "bg-[#FA1A09] ",
    [RecordStatus.SUCCESS]: "bg-[#1FEF68] text-[#06371D]",
    [RecordStatus.PENDING]: "bg-[#F5D113] text-[#573800]",
};
  
export const Status: FC<statusProps> = ({
    status,
    classname,
    onClick,
    style,
}) => {
    return (
        <div className={`flex w-20 items-center h-6 px-2 rounded-full border-2 border-black border-b-4 shadow-md ${chipColor[status as RecordStatus]} ${classname}` } style={style} onClick={onClick}>
        {status === RecordStatus.SUCCESS ? (
        <>
          <FaCircleCheck className="mr-1  text-xm" />
          <p className={`text-[10px]  font-extrabold `}>
            Complete
          </p>
        </>) : status === RecordStatus.PENDING ?(
        <>
        <PiWarningOctagonFill  className="mr-1 text-xm" />
        <p className={`text-[10px]  font-extrabold `}>
          In Process
        </p>
        </>) : (
        <>
        <IoIosCloseCircle  className="mr-1 text-xm" />
        <p className={`text-[10px]  font-extrabold `}>
          Failed
        </p>
        </>)}
  </div>
  )};
  
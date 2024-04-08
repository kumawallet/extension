import { CSSProperties, FC, HTMLAttributes } from "react";
import { RecordStatus } from "@src/storage/entities/activity/types";
import { FaCircleCheck } from "react-icons/fa6";
import { IoIosCloseCircle } from "react-icons/io";
import { PiWarningOctagonFill } from "react-icons/pi";
import { styleTxStatus } from "@src/components/common/styles/TxStatus";

interface statusProps {
    status: RecordStatus;
    classname?: HTMLAttributes<HTMLButtonElement>["className"];
    isDisabled?: boolean;
    onClick?: () => void;
    style?: CSSProperties;
}

const chipColor = {
    [RecordStatus.FAIL]: styleTxStatus.red,
    [RecordStatus.SUCCESS]: styleTxStatus.green,
    [RecordStatus.PENDING]: styleTxStatus.yellow,
};

export const Status: FC<statusProps> = ({
    status,
    classname,
    onClick,
    style,
}) => {
    return (
        <div className={`${styleTxStatus.container} ${chipColor[status as RecordStatus]} ${classname}`} style={style} onClick={onClick}>
            {status === RecordStatus.SUCCESS ? (
                <>
                    <FaCircleCheck className={styleTxStatus.icons} />
                    <p className={styleTxStatus.text}>
                        Complete
                    </p>
                </>
            ) : status === RecordStatus.PENDING ? (
                <>
                    <PiWarningOctagonFill className={styleTxStatus.icons} />
                    <p className={styleTxStatus.text}>
                        In Process
                    </p>
                </>
            ) : (
                <>
                    <IoIosCloseCircle className={styleTxStatus.icons} />
                    <p className={styleTxStatus.text}>
                        Failed
                    </p>
                </>
            )}
        </div>
    );
};
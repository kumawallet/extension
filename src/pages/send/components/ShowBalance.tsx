import {formatBN} from "@src/utils/assets";
import {useFormContext} from "react-hook-form";
import {useTranslation} from "react-i18next";

export const ShowBalance = () => {
    const {t} = useTranslation("send");

    const {watch} = useFormContext();

    const asset = watch("asset");


    const decimals = asset?.decimals

    const showTransferable =
        asset?.transferable && !asset?.transferable?.eq(asset?.balance);

    const showAmount = asset?.balance && String(asset?.balance) !== "0";

    return (
        <div
            className="text-start flex-col text-sm rounded-lg  flex w-full p-2.5 bg-[#343A40] border-gray-600 placeholder-gray-400 text-white gap-1 mb-3">
            <p>
              {t("total")}: {showAmount ? formatBN(String(asset?.balance), decimals) : 0}
            </p>
            {showTransferable && (
                <p>{t("available")}: {formatBN(String(asset?.transferable), decimals)}</p>
            )}
        </div>
    );
};

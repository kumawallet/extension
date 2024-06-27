import { ICON_SIZE } from "@src/constants/icons";
import { FiChevronLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { PageWrapper, Button } from "@src/components/common";
import { useState, useEffect } from "react";
import {
  topbarIcon,
  topbarText,
  topbarContainer,
  styleButtomNav,
} from "../../style/style";
import { messageAPI } from "@src/messageAPI/api";
import { useToast } from "@src/hooks";
import { useTranslation } from "react-i18next";

const TIME_LOCK_OPTIONS = [
  {
    value: 5,
  },
  {
    value: 10,
  },
  {
    value: 15,
  },
  {
    value: 20,
  },
  {
    value: 30,
  },
  {
    value: 60,
  },
];

export const AutoLock = () => {
  const { t: tcommon } = useTranslation("common");
  const { t } = useTranslation("settings");
  const navigate = useNavigate();
  const { showErrorToast, showSuccessToast } = useToast();

  const [lock, setLock] = useState<number>(0);

  useEffect(() => {
    getLock();
  }, []);

  const getLock = async () => {
    try {
      const lock = await messageAPI.getLock();
      setLock(lock);
    } catch (error) {
      showErrorToast(`${error}`);
      return false;
    }
  };

  const setAutolock = async (time: number) => {
    try {
      if (time > 0) {
        await messageAPI?.setAutoLock({
          time,
        });
        showSuccessToast(tcommon("success"));
      }
    } catch (error) {
      showErrorToast(`${error}`);
      return false;
    }
  };

  return (
    <PageWrapper>
      <div className={topbarContainer}>
        <FiChevronLeft
          data-testid="back-button"
          className={topbarIcon}
          size={ICON_SIZE}
          onClick={() => navigate(-1)}
        />
        <p className={topbarText}>{t("autolock.title")}</p>
      </div>
      <div data-testid="time-options" className="flex flex-col gap-1">
        {TIME_LOCK_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            variant="contained-black"
            onClick={() => {
              setLock(opt.value);
              setAutolock(opt.value);
            }}
            classname={`${styleButtomNav} w-full justify-between `}
          >
            <div className="flex items-center">
              <p className="text-sm">{`${opt.value} ${t(
                "autolock.minutes"
              )}`}</p>
            </div>
            <div
              className={`p-1 text-[6px] rounded-full border relative ${lock === opt.value
                ? "border-[#2CEC84] text-[#2CEC84] active-wallet-icon"
                : "border-gray-300"
                } `}
            />
          </Button>
        ))}
      </div>
    </PageWrapper>
  );
};

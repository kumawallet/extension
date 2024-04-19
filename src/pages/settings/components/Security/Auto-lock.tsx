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


export const AutoLock = () => {
  // const { t } = useTranslation("security");
  const navigate = useNavigate();
  const { showErrorToast, showSuccessToast } = useToast();
  const timeLock = [
    {
      title: "5 min",
      value: 5
    },
    {
      title: "10 min",
      value: 10
    },
    {
      title: "15 min",
      value: 15
    },
    {
      title: "20 min",
      value: 20
    },
    {
      title: "30 min",
      value: 30
    },
    {
      title: "60 min",
      value: 60
    },
  ]
  const [lock, setLock] = useState<number>(0);

  useEffect(() => {
    getLock();
  }, [])

  const getLock = async () => {
    try {
      const lock = await messageAPI.getLock();
      setLock(lock);
    }
    catch (error) {
      showErrorToast(`${error}`);
      return false
    }

  }
  const setAutolock = async (time: number) => {
    try {
      if (time > 0) {

        await messageAPI?.setAutoLock({
          time
        })
        showSuccessToast("success")
      }

    }
    catch (error) {
      showErrorToast(`${error}`);
      return false
    }

  }
  return (
    <PageWrapper>
      <div className={topbarContainer}>
        <FiChevronLeft
          className={topbarIcon}
          size={ICON_SIZE}
          onClick={() => navigate(-1)}
        />
        <p className={topbarText}>Set auto-lock time</p>
      </div>
      <div className="flex flex-col gap-1">
        {timeLock.map((opt) => (
          <Button
            key={opt.value}
            variant="contained-black"
            onClick={() => {
              setLock(opt.value)
              setAutolock(opt.value)
            }}
            classname={`${styleButtomNav} w-full justify-between `}
          >
            <div className="flex items-center">
              <p className="text-sm">{opt.title}</p>
            </div>
            <div
              className={`p-1 text-[6px] rounded-full border relative ${lock === opt.value ? "border-[#2CEC84] text-[#2CEC84] active-wallet-icon" : "border-gray-300"} `}
            />
          </Button>
        ))
        }
      </div>
    </PageWrapper>
  );
};


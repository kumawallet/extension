import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiChevronLeft } from "react-icons/fi";
import { BsChevronRight } from "react-icons/bs";
import { LuBook } from "react-icons/lu";
import { IoShieldOutline } from "react-icons/io5";
import { TbMessageQuestion } from "react-icons/tb";
import { BiHomeAlt2 } from "react-icons/bi";
import {
  SETTINGS_GENERAL,
  SETTINGS_CONTACTS,
  SETTINGS_SECURITY,
  SETTINGS_BUG,
} from "@src/routes/paths";
import { PageWrapper, Button } from "@src/components/common";
import { version } from "@src/utils/env";
import { ICON_SIZE } from "@src/constants/icons";
import { topbarIcon, topbarText, topbarContainer, styleButtomNav } from './style/style';
import { aboutUsLinks } from "../../utils/constants";
import { FaRegKeyboard } from "react-icons/fa6";
import { FaTwitter, FaDiscord, FaTelegramPlane } from "react-icons/fa";


const OPTIONS = [
  {
    text: "general",
    href: SETTINGS_GENERAL,
    icon: BiHomeAlt2
  },
  {
    text: "address_book",
    href: SETTINGS_CONTACTS,
    icon: LuBook
  },
  {
    text: "security",
    href: SETTINGS_SECURITY,
    icon: IoShieldOutline
  },
  {
    text: "bug_report",
    href: SETTINGS_BUG,
    icon: TbMessageQuestion
  }
];






export const Settings = () => {
  const { t } = useTranslation("settings");
  const navigate = useNavigate()

  const links = [
    {
      title: `${t("webside")}`,
      url: aboutUsLinks.kuma,
      icon: FaRegKeyboard,
    },
    {
      title: "Twitter",
      url: aboutUsLinks.twitter,
      icon: FaTwitter,
    },
    {
      title: "Discord",
      url: aboutUsLinks.discord,
      icon: FaDiscord,
    },
    
    {
      title: "Telegram",
      url: aboutUsLinks.telegram,
      icon: FaTelegramPlane,
    },
  ]
  return (
    <PageWrapper>
      <div className="h-full flex flex-col overflow-auto settings-container">
        <div className="text-start px-4 pt-2 flex-1">
          <div>
            <div className={topbarContainer}>
              <FiChevronLeft
                className={topbarIcon}
                size={ICON_SIZE}
                onClick={() => navigate(-1)}
              />
              <p className={topbarText}>{t("title")}</p>
            </div>
            <div className="flex flex-col gap-1">
              {OPTIONS.map((opt) => (
                <Button
                  key={opt.text}
                  variant="contained-black"
                  onClick={() => navigate(opt.href)}
                  classname={`${styleButtomNav} w-full justify-between `}
                >
                  <div className="flex items-center">
                    < opt.icon className="ml-5 mr-4 text-sm" />
                    <p className="text-sm">{t(opt.text)}</p>
                  </div>
                  <BsChevronRight />
                </Button>
              ))
              }
              {links.map((opt) => (
                <a
                  key={opt.title}
                  href={opt.url as unknown as string}
                  target="_blank"
                  rel="noreferrer"
                  className={`${styleButtomNav} bg-[#1C1C27] border-0 hover:bg-linear`}
                >
                  < opt.icon className=" ml-5 mr-4 text-sm" />
                  <p className="text-sm">{t(opt.title)}</p>
                </a>
              ))
              }
            </div>
          </div>
        </div>
        <p data-testid="version" className="text-center text-sm text-gray-400">
          {version}
        </p>
      </div>
    </PageWrapper>
  );
};

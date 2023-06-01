import { ICON_SIZE } from "@src/constants/icons";
import { FiChevronLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@src/components/common/PageWrapper";
import { useTranslation } from "react-i18next";
import { aboutUsLinks } from "../../utils/constants";
import {
  BsDiscord,
  BsGithub,
  BsTwitter,
  BsTelegram,
} from "react-icons/bs";

const links = [
  {
    title: "Kuma Wallet",
    url: aboutUsLinks.kuma,
    icon: (
      <img
        src={"/icon-34.png"}
        alt={"kuma"}
        width={30}
        height={30}
      />
    )
  },
  {
    title: "Discord",
    url: aboutUsLinks.discord,
    icon: <BsDiscord size={30} color="#7289da" />,
  },
  {
    title: "Github",
    url: aboutUsLinks.github,
    icon: <BsGithub size={30} color="#000"/>,
  },
  {
    title: "Twitter",
    url: aboutUsLinks.twitter,
    icon: <BsTwitter size={30} color="#1DA1F2" />,
  },
  {
    title: "Telegram",
    url: aboutUsLinks.telegram,
    icon: <BsTelegram size={30} color="#2AABEE" />,
  },
  {
    title: "Blockcoders",
    url: aboutUsLinks.blockcoders,
    icon: (
      <img
        src={"/images/blockcoders.png"}
        alt={"blockcoders"}
        width={30}
        height={30}
      />
    ),
  },
];

export const AboutUs = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("settings");

  return (
    <PageWrapper>
      <div className="flex items-center gap-3 mb-10">
        <FiChevronLeft
          className="cursor-pointer"
          size={ICON_SIZE}
          onClick={() => navigate(-1)}
        />
        <p className="font-medium text-2xl">{t("about_us")}</p>
      </div>
      {links.map((link, index) => (
        <a key={index} href={link.url} target="_blank" rel="noreferrer">
          <div className="py-4 mb-4 shadow-lg flex rounded-lg justify-center items-center gap-2 transition-all hover:bg-[#469999] hover:bg-opacity-20 hover:scale-105 border border-opacity-5 border-[#ddd4]">
            {link.icon}
            <span className="text-2xl">{link.title}</span>
          </div>
        </a>
      ))}
    </PageWrapper>
  );
};

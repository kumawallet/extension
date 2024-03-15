
import { aboutUsLinks } from "../../../../utils/constants";
import { FaRegKeyboard } from "react-icons/fa6";
import { FaTwitter, FaDiscord, FaTelegramPlane } from "react-icons/fa";


export const links = [
  {
    title: "Website",
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
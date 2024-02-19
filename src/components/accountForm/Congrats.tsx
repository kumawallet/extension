import doneLogo from "/icons/done.png"
import { TwitterColored } from "../icons/TwitterColored"
import { TelegramColored } from "../icons/TelegramColored"
import { DiscordColored } from "../icons/DiscordColored"
import { aboutUsLinks } from "@src/utils/constants"
import { useTranslation } from "react-i18next"

export const Congrats = () => {
  const { t } = useTranslation("account_form")

  return (
    <div className="flex-1 flex flex-col justify-between pt-12 pb-24">
      <div className="flex flex-col gap-6 text-center">
        <h3 className="font-medium text-xl md:text-5xl">{t("congrats_title")}</h3>
        <p className="whitespace-pre-line text-2xl text-gray-300">{t("congrats_description")}</p>
      </div>
      <img src={doneLogo} alt="" width={120} className="aspect-square mx-auto" />
      <div className="flex items-center justify-evenly">
        <a href={aboutUsLinks.twitter.toString()}>
          <TwitterColored className="w-10 h-10" />
        </a>

        <a href={aboutUsLinks.telegram.toString()}>
          <TelegramColored className="w-10 h-10" />
        </a>

        <a href={aboutUsLinks.discord.toString()}>
          <DiscordColored className="w-10 h-10" />
        </a>
      </div>
    </div>
  )
}

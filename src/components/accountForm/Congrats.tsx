import doneLogo from "/icons/done.png"
import { TwitterColored } from "../icons/TwitterColored"
import { TelegramColored } from "../icons/TelegramColored"
import { DiscordColored } from "../icons/DiscordColored"

export const Congrats = () => {
  return (
    <div className="flex-1 flex flex-col justify-between pt-12 pb-32">
      <img src={doneLogo} alt="" width={120} className="aspect-square mx-auto" />
      <div className="flex items-center justify-evenly">
        <TwitterColored className="w-10 h-10" />
        <TelegramColored className="w-10 h-10" />
        <DiscordColored className="w-10 h-10" />
      </div>
    </div>
  )
}

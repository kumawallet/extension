import { FC, PropsWithChildren } from "react"
import { ColoredBackground, KumaLetters, Logo, PageWrapper } from "../common"
import { GoChevronLeft } from "react-icons/go";

interface AccountFormWrapperProps extends PropsWithChildren {
  footer?: JSX.Element | null
  showBackButton?: boolean
  onBack?: () => void
  title?: string
  description: string
  centerInnerTitle?: boolean
  topMessage?: JSX.Element
}

export const AccountFormWrapper: FC<AccountFormWrapperProps> = ({
  children,
  footer = null,
  showBackButton,
  onBack,
  title,
  description,
  centerInnerTitle = false,
  topMessage = null
}) => {
  return (
    <PageWrapper
      contentClassName="flex-1 !py-0 !px-0 md:px-4 bg-[#1F1432]"
      innerContentClassName="!static z-0 !max-w-2xl"
    >
      <ColoredBackground
        bg1ClassName="z-[-1] h-[unset] w-[unset]"
        bg2ClassName="z-[-1] h-[unset] w-[unset]"
        starClassName="z-[-1]"
      />
      <div className="flex flex-col h-full">
        <div className="hidden md:flex justify-center items-center gap-2 mx-auto py-4">
          <Logo className="w-10 h-10" />
          <KumaLetters className="w-20" />
        </div>

        {topMessage}

        <div className="bg-[#1C1C1C] md:rounded-t-2xl px-4 md:px-12 py-5 flex flex-col flex-1">
          {
            showBackButton && (
              <div className="py-1 mb-3">
                <button
                  className="text-white text-xs font-bold flex items-center gap-1"
                  onClick={onBack}
                >
                  <GoChevronLeft className="inline" size={15} />
                  <span>back</span>
                </button>
              </div>
            )
          }
          <div className="flex-1 flex flex-col">
            <div className={`flex flex-col gap-2 ${centerInnerTitle ? "text-center" : ""}`}>
              {title && <h3 className="font-medium text-xl md:text-3xl">{title}</h3>}
              <p className="whitespace-pre-line md:text-sm text-gray-300">{description}</p>
            </div>
            {children}
          </div>
          {footer}
        </div>
      </div>
    </PageWrapper>
  )
}

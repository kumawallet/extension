import { FC, PropsWithChildren } from "react"
import { ColoredBackground, KumaLetters, Logo, PageWrapper } from "../common"
import { GoChevronLeft } from "react-icons/go";
import { useTranslation } from "react-i18next";

interface AccountFormWrapperProps extends PropsWithChildren {
  footer?: JSX.Element | null
  showBackButton?: boolean
  onBack?: () => void
  title?: string
  description: string
  descriptionClassName?: string
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
  topMessage = null,
  descriptionClassName = ""
}) => {
  const { t } = useTranslation("account_form")

  return (
    <PageWrapper
      contentClassName="flex-1 !py-0 !px-0 md:px-0 bg-[#1F1432]"
      innerContentClassName="!static z-0 !max-w-[584px] !px-0"
    >
      <ColoredBackground
        bg1ClassName="z-[-1] h-[unset] w-[unset]"
        bg2ClassName="z-[-1] h-[unset] w-[unset]"
        starClassName="z-[-1]"
      />
      <div className="flex flex-col h-full">
        <div className="hidden md:flex justify-center items-center gap-2 mx-auto pt-12 pb-4">
          <Logo className="w-16 h-16" />
          <KumaLetters className="w-32" />
        </div>

        {topMessage}

        <div className="bg-[#1C1C1C] md:rounded-t-2xl px-4 md:px-12 pt-5 pb-10 flex flex-col flex-1">
          {
            showBackButton && (
              <div className="py-1 mb-5">
                <button
                  className="text-gray-300 text-xl font-light flex items-center gap-1"
                  onClick={onBack}
                >
                  <GoChevronLeft className="inline" size={20} />
                  <span>{t('back')}</span>
                </button>
              </div>
            )
          }
          <div className="flex-1 flex flex-col">
            <div className={`flex flex-col gap-6 ${centerInnerTitle ? "text-center" : ""}`}>
              {title && <h3 className="font-medium text-xl md:text-[2rem]">{title}</h3>}
              {description &&
                <p className={`whitespace-pre-line md:text-base text-gray-300 ${descriptionClassName}`}>{description}</p>
              }
            </div>
            {children}
          </div>
          {footer}
        </div>
      </div>
    </PageWrapper>
  )
}

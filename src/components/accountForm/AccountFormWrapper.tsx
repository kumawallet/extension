import { FC, PropsWithChildren } from "react"
import { ColoredBackground, HeaderBack, KumaLetters, Logo, PageWrapper } from "../common"
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
      contentClassName="flex-1 !py-0 !px-0 md:px-0  md:pb-0  snap-none !bg-[#1F1432]"
      innerContentClassName="!static z-0 !max-w-[584px] !px-0 border-none !py-0 !bg-[#1F1432]"
    >
      <ColoredBackground
        bg1ClassName="z-[-1] h-[unset] w-[unset]"
        bg2ClassName="z-[-1] h-[unset] w-[unset]"
        starClassName="z-[-1]"
      />
      <div className="flex flex-col h-full">
        <div className="hidden md:flex justify-center items-center gap-2 mx-auto pt-8 pb-4">
          <Logo size="60" />
          <KumaLetters className="w-32" />
        </div>

        {topMessage}

        <div className="bg-[#171720] md:rounded-t-2xl px-4 md:px-12 md:pb-2 pt-4 pb-10 flex flex-col flex-1">
          {
            showBackButton && (
              <HeaderBack title={t('back')} onBack={onBack} classNameContainer="ml-[-0.35rem] !mb-[1rem]"/>
            )
          }
          <div className="flex-1 flex flex-col relative ">
            <div className={`flex flex-col gap-3 ${centerInnerTitle ? "text-center" : ""}`}>
              {title && <h3 className="font-normal text-lg md:text-[1.5rem]">{title}</h3>}
              {description &&
                <p className={`whitespace-pre-line leading-snug md:text-sm text-gray-300 ${descriptionClassName}`}>{description}</p>
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

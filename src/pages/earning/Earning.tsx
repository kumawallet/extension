import { Button, PageTitle, PageWrapper } from '@src/components/common'
import { useTranslation } from 'react-i18next';
import { Frecuency, SelectableAsset } from './components';
import { HiMiniArrowsRightLeft } from "react-icons/hi2"
import { NumericFormat } from 'react-number-format';
import { useThemeContext } from '@src/providers';

const MOCK_ASSETS = [
  {
    label: "ETH",
    image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880",
  },
  {
    label: "BTC",
    image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png?1547033579",
  },
  {
    label: "USDT",
    image: "https://assets.coingecko.com/coins/images/325/small/Tether-logo.png?1598003707",
  }
]

export const Earning = () => {
  const { t } = useTranslation("earning");
  const { color } = useThemeContext()


  return (
    <PageWrapper contentClassName="bg-[#29323C] h-full flex flex-col"
      innerContentClassName='flex flex-col'
    >
      <div className='flex flex-col flex-1'>
        <PageTitle
          title={t("title")}
          canNavigateBack
        />
        <div className='flex-1'>
          <div className='flex justify-center items-center gap-3'>
            <SelectableAsset
              value={MOCK_ASSETS[0]}
              options={MOCK_ASSETS}
              onChange={(value) => console.log(value)}
              defaulValue={MOCK_ASSETS[0]}
              label={t("sell") as string}
            />
            <HiMiniArrowsRightLeft className="mt-7" size={20} />
            <SelectableAsset
              value={MOCK_ASSETS[0]}
              options={MOCK_ASSETS}
              onChange={(value) => console.log(value)}
              defaulValue={MOCK_ASSETS[0]}
              label={t("receive") as string}
            />
          </div>

          <div className="mt-10">
            <div className='flex justify-between mb-1'>
              <p className="font-inter font-bold text-lg">{t("investment_amount")}</p>
              <p className="font-inter font-bold text-lg text-[#9CA3AF]">{t("balance")}: 0</p>
            </div>

            <div className='flex'>
              <div className='flex-1 relative h-fit w-[60%]'>
                <NumericFormat
                  className={`input-secondary py-3 rounded-2xl pr-12 outline outline-transparent focus:outline-${color}-primary hover:outline-${color}-primary rounded-r-none`}
                  allowNegative={false}
                  allowLeadingZeros={false}
                  // value={getValues("amount")}
                  // onValueChange={({ value }) => {
                  //   setValue("amount", value || "0");
                  // }}
                  allowedDecimalSeparators={["%"]}
                />
                <button className='absolute right-3 -translate-y-1/2 top-1/2 text-bold text-[#D1D5DB] hover:bg-gray-400 hover:bg-opacity-40 p-1 rounded-2xl'>{t("max")}</button>
              </div>
              <SelectableAsset
                value={MOCK_ASSETS[0]}
                options={MOCK_ASSETS}
                onChange={(value) => console.log(value)}
                defaulValue={MOCK_ASSETS[0]}
                containerClassName='flex-none w-[40%] border-l-[0.1px] border-l-[#E5E7EB]'
                buttonClassName='rounded-l-none'
              />

            </div>

          </div>

          <div className='mt-10'>
            <Frecuency />
          </div>
        </div>
      </div>

      <div className='py-2'>
        <Button classname={`font-medium text-base capitalize py-2 bg-[#212529] hover:bg-${color}-primary m-0 !w-full`}>
          {t("proceed")}
        </Button>
      </div>

    </PageWrapper>
  )
}

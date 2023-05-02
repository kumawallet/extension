import { useMemo } from "react";
import { PageWrapper } from "@src/components/common/PageWrapper";
import { Tab } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import { Activity, Assets, Header, Footer, TotalBalance } from "./components";
import { useLocation } from "react-router-dom";
import { useNetworkContext } from "@src/providers";
import { ethers } from "ethers";
import erc20abi from "@src/constants/erc20.abi.json";
import Extension from "@src/Extension";
import xTokensABi from "./xTokenx";
import { decodeAddress } from "@polkadot/util-crypto";
import { u8aToHex } from "@polkadot/util";

export interface Asset {
  name: string;
  symbol: string;
  decimals: number;
  amount: number;
  usdPrice: number;
}

export const Balance = () => {
  const { t } = useTranslation("balance");
  const { state } = useLocation();

  const {
    state: { api },
  } = useNetworkContext();

  const TABS = useMemo(() => {
    return [
      {
        name: t("assets"),
        component: <Assets />,
      },
      {
        name: t("activity"),
        component: <Activity />,
      },
    ];
  }, []);

  const test = async () => {
    const a = u8aToHex(
      decodeAddress("5GWpSdqkkKGZmdKQ9nkSF7TmHp6JWt28BMGQNuG4MXtSvq3e"),
      undefined,
      false
    );

    console.log("a", a);

    try {
      const pk = await Extension.showPrivateKey();

      const wallet = new ethers.Wallet(
        pk as string,
        api as ethers.providers.JsonRpcProvider
      );

      const contract = new ethers.Contract(
        "0x0000000000000000000000000000000000000804",
        xTokensABi,
        wallet
      );

      console.log("erc", contract.estimateGas);

      const feeData = await api.getFeeData();
      // const gasLimit = await contract.estimateGas.transferMultiasset(
      //   [1, []],
      //   "1000000000000",
      //   [
      //     1,
      //     [
      //       u8aToHex(
      //         decodeAddress("5FFKXA5vsYjHSoLsmg1mLJybL7qPXVnVwAuTanSK5FesYrCH")
      //       ),
      //     ],
      //   ],
      //   "1000000000"
      // );
      // console.log("gastLimit", gasLimit.toString());

      // const _gasLimit = feeData;
      const _maxFeePerGas = feeData.maxFeePerGas as ethers.BigNumber;
      const _maxPriorityFeePerGas =
        feeData.maxPriorityFeePerGas as ethers.BigNumber;

      const avg = _maxFeePerGas.add(_maxPriorityFeePerGas).div(2);
      // const estimatedTotal = avg.mul(_gasLimit);

      console.log("fee data", feeData);

      const tx = await contract.transferMultiasset(
        [1, []],
        "1000000000000",
        [
          1,
          [
            "0x01" +
              u8aToHex(
                decodeAddress(
                  "5GvJw6rCGjXGoBxSERbGsUCQceaL4bGCq7TPsuNdPckHfYif"
                ),
                undefined,
                false
              ) +
              "00",
          ],
        ],
        "1000000000",
        {
          gasLimit: ethers.BigNumber.from("210000"),
          maxFeePerGas: _maxFeePerGas,
          maxPriorityFeePerGas: _maxPriorityFeePerGas,
          type: 2,
        }
      );

      await tx.wait();
      console.log(tx);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Header />
      <button onClick={test}>test</button>
      <PageWrapper contentClassName="pt-6 pb-16">
        <div className="flex flex-col">
          <TotalBalance />

          <Tab.Group defaultIndex={state?.tab === "activity" ? 1 : 0}>
            <Tab.List className="flex space-x-1 p-1 border-b-[1px] border-b-[#343A40] mt-5">
              {TABS.map((tab, index) => (
                <Tab
                  key={tab.name}
                  className={({ selected }) =>
                    `px-4 py-1 focus:outline-none relative ${
                      selected
                        ? index === 0
                          ? "text-custom-green-bg active-tab"
                          : "text-[#FFC300] active-tab"
                        : "text-white"
                    }`
                  }
                >
                  {tab.name}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="mt-2 px-4">
              <Tab.Panel key={0}>
                <Assets />
              </Tab.Panel>
              <Tab.Panel key={1}>
                <Activity />
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </PageWrapper>
      <Footer />
    </>
  );
};

import { Loading, PageTitle, PageWrapper } from "@src/components/common";
import { useAccountContext, useNetworkContext } from "@src/providers";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { ASSETS_INFO, EarningAssets } from "../earning/utils/assets-per-chain";
import { Framework, SuperToken } from "@superfluid-finance/sdk-core";
import { useLoading, useToast } from "@src/hooks";
import { BigNumber, Contract, utils, ethers } from "ethers";
import { BsPencil } from "react-icons/bs";
import { AiFillDelete } from "react-icons/ai";
import { format } from "date-fns";
import { ConfirmDialog, PriceChart } from "./components";
import Extension from "@src/Extension";
import { EARNING } from "@src/routes/paths";

const ANIMATION_MINIMUM_STEP_TIME = 10;
const REFRESH_INTERVAL = 3000; // 300 * 100 = 30000 ms = 30 s

const poolAddress = "0x0794c89b0767d480965574Af38052aab32496E00";
const poolABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "uint32",
        name: "time",
        type: "uint32",
      },
    ],
    name: "getUserBalancesAtTime",
    outputs: [
      {
        internalType: "uint",
        name: "balance0",
        type: "uint",
      },
      {
        internalType: "uint",
        name: "balance1",
        type: "uint",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "time",
        type: "uint32",
      },
    ],
    name: "getReservesAtTime",
    outputs: [
      {
        internalType: "uint112",
        name: "_reserve0",
        type: "uint112",
      },
      {
        internalType: "uint112",
        name: "_reserve1",
        type: "uint112",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export const cfaABI = [{ "inputs": [{ "internalType": "contract ISuperfluid", "name": "host", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [], "name": "CFA_FWD_INVALID_FLOW_RATE", "type": "error" }, { "inputs": [{ "internalType": "contract ISuperToken", "name": "token", "type": "address" }, { "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "receiver", "type": "address" }, { "internalType": "int96", "name": "flowrate", "type": "int96" }, { "internalType": "bytes", "name": "userData", "type": "bytes" }], "name": "createFlow", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "contract ISuperToken", "name": "token", "type": "address" }, { "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "receiver", "type": "address" }, { "internalType": "bytes", "name": "userData", "type": "bytes" }], "name": "deleteFlow", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "contract ISuperToken", "name": "token", "type": "address" }, { "internalType": "address", "name": "account", "type": "address" }], "name": "getAccountFlowInfo", "outputs": [{ "internalType": "uint256", "name": "lastUpdated", "type": "uint256" }, { "internalType": "int96", "name": "flowrate", "type": "int96" }, { "internalType": "uint256", "name": "deposit", "type": "uint256" }, { "internalType": "uint256", "name": "owedDeposit", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "contract ISuperToken", "name": "token", "type": "address" }, { "internalType": "address", "name": "account", "type": "address" }], "name": "getAccountFlowrate", "outputs": [{ "internalType": "int96", "name": "flowrate", "type": "int96" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "contract ISuperToken", "name": "token", "type": "address" }, { "internalType": "int96", "name": "flowrate", "type": "int96" }], "name": "getBufferAmountByFlowrate", "outputs": [{ "internalType": "uint256", "name": "bufferAmount", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "contract ISuperToken", "name": "token", "type": "address" }, { "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "receiver", "type": "address" }], "name": "getFlowInfo", "outputs": [{ "internalType": "uint256", "name": "lastUpdated", "type": "uint256" }, { "internalType": "int96", "name": "flowrate", "type": "int96" }, { "internalType": "uint256", "name": "deposit", "type": "uint256" }, { "internalType": "uint256", "name": "owedDeposit", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "contract ISuperToken", "name": "token", "type": "address" }, { "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "flowOperator", "type": "address" }], "name": "getFlowOperatorPermissions", "outputs": [{ "internalType": "uint8", "name": "permissions", "type": "uint8" }, { "internalType": "int96", "name": "flowrateAllowance", "type": "int96" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "contract ISuperToken", "name": "token", "type": "address" }, { "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "receiver", "type": "address" }], "name": "getFlowrate", "outputs": [{ "internalType": "int96", "name": "flowrate", "type": "int96" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "contract ISuperToken", "name": "token", "type": "address" }, { "internalType": "address", "name": "flowOperator", "type": "address" }], "name": "grantPermissions", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "contract ISuperToken", "name": "token", "type": "address" }, { "internalType": "address", "name": "flowOperator", "type": "address" }], "name": "revokePermissions", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "contract ISuperToken", "name": "token", "type": "address" }, { "internalType": "address", "name": "receiver", "type": "address" }, { "internalType": "int96", "name": "flowrate", "type": "int96" }], "name": "setFlowrate", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "contract ISuperToken", "name": "token", "type": "address" }, { "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "receiver", "type": "address" }, { "internalType": "int96", "name": "flowrate", "type": "int96" }], "name": "setFlowrateFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "contract ISuperToken", "name": "token", "type": "address" }, { "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "receiver", "type": "address" }, { "internalType": "int96", "name": "flowrate", "type": "int96" }, { "internalType": "bytes", "name": "userData", "type": "bytes" }], "name": "updateFlow", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "contract ISuperToken", "name": "token", "type": "address" }, { "internalType": "address", "name": "flowOperator", "type": "address" }, { "internalType": "uint8", "name": "permissions", "type": "uint8" }, { "internalType": "int96", "name": "flowrateAllowance", "type": "int96" }], "name": "updateFlowOperatorPermissions", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }];

export const EarningDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate()

  const { t } = useTranslation("earning");
  const {
    state: { api, selectedChain },
  } = useNetworkContext();
  const {
    state: { selectedAccount },
  } = useAccountContext();

  const { isLoading, endLoading, starLoading } = useLoading(true);
  const { showErrorToast, showSuccessToast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [token1, setToken1] = useState<SuperToken | null>(null);
  const [token2, setToken2] = useState<SuperToken | null>(null);
  const [time, setTime] = useState(REFRESH_INTERVAL);
  const [token1Name, setToken1Name] = useState<string>("");
  const [token2Name, setToken2Name] = useState<string>("");

  const [flowRate0, setFlowRate0] = useState<BigNumber>(BigNumber.from(0));
  const [flowRate1, setFlowRate1] = useState<BigNumber>(BigNumber.from(0));
  const [deleteSwapFee, setDeleteSwapFee] = useState<string>("0");

  const [currentBalance0, setCurrentBalance0] = useState<BigNumber>(
    BigNumber.from(0)
  );
  const [currentBalance1, setCurrentBalance1] = useState<BigNumber>(
    BigNumber.from(0)
  );

  const [currentTwapBalance0, setCurrentTwapBalance0] = useState<BigNumber>(
    BigNumber.from(0)
  );
  const [twapFlowRate0, setTwapFlowRate0] = useState<BigNumber>(
    BigNumber.from(0)
  );

  const [currentTwapBalance1, setCurrentTwapBalance1] = useState<BigNumber>(
    BigNumber.from(0)
  );
  const [twapFlowRate1, setTwapFlowRate1] = useState<BigNumber>(
    BigNumber.from(0)
  );
  const [currentPrice, setCurrentPrice] = useState<number>(0);

  const poolContract = new Contract(poolAddress, poolABI, api);


  const refreshFlowRate = async () => {
    if (!token1 || !token2 || !poolContract) return;

    const _token1 = await token1.getFlow({
      providerOrSigner: api,
      sender: selectedAccount.value.address,
      receiver: poolAddress,
    });

    const _token2 = await token2.getFlow({
      providerOrSigner: api,
      sender: selectedAccount.value.address,
      receiver: poolAddress,
    });

    const currentTimestampBigNumber = ethers.BigNumber.from(
      new Date().valueOf().toString() // Milliseconds elapsed since UTC epoch, disregards timezone.
    );
    const currentTimestamp = currentTimestampBigNumber.div(1000).toString();

    const futureTimestamp = currentTimestampBigNumber
      .div(1000)
      .add((REFRESH_INTERVAL * ANIMATION_MINIMUM_STEP_TIME) / 1000)
      .toString();

    const [presentLockedBalances, futureLockedBalances, reserves] =
      await Promise.all([
        poolContract.getUserBalancesAtTime(
          selectedAccount.value.address,
          currentTimestamp
        ),
        poolContract.getUserBalancesAtTime(
          selectedAccount.value.address,
          futureTimestamp
        ),
        poolContract.getReservesAtTime(currentTimestamp),
      ]);

    const _presentLockedBalances = {
      balance0: presentLockedBalances[0],
      balance1: presentLockedBalances[1],
    };

    const _futureLockedBalances = {
      balance0: futureLockedBalances[0],
      balance1: futureLockedBalances[1],
    };

    const _reserves = {
      reserve0: reserves[0],
      reserve1: reserves[1],
    };

    const initialBalance0 = BigNumber.from(_token1.flowRate).mul(
      currentTimestampBigNumber
        .sub(BigNumber.from(_token1.timestamp.getTime() / 1000).mul(1000))
        .div(1000)
    );
    const futureBalance0 = BigNumber.from(_token1.flowRate).mul(
      currentTimestampBigNumber
        .sub(BigNumber.from(_token1.timestamp.getTime() / 1000).mul(1000))
        .div(1000)
        .add((REFRESH_INTERVAL * ANIMATION_MINIMUM_STEP_TIME) / 1000)
    );
    const initialBalance1 = BigNumber.from(_token2.flowRate).mul(
      currentTimestampBigNumber
        .sub(BigNumber.from(_token2.timestamp.getTime() / 1000).mul(1000))
        .div(1000)
    );
    const futureBalance1 = BigNumber.from(_token2.flowRate).mul(
      currentTimestampBigNumber
        .sub(BigNumber.from(_token2.timestamp.getTime() / 1000).mul(1000))
        .div(1000)
        .add((REFRESH_INTERVAL * ANIMATION_MINIMUM_STEP_TIME) / 1000)
    );

    setFlowRate0(futureBalance0.sub(initialBalance0).div(REFRESH_INTERVAL));
    setFlowRate1(futureBalance1.sub(initialBalance1).div(REFRESH_INTERVAL));

    setCurrentBalance0(initialBalance0);
    setCurrentBalance1(initialBalance1);
    setCurrentTwapBalance0(_presentLockedBalances.balance0);
    setCurrentTwapBalance1(_presentLockedBalances.balance1);
    const calcTwapFlowRate0 = _futureLockedBalances.balance0
      .sub(_presentLockedBalances.balance0)
      .div(REFRESH_INTERVAL);
    const calcTwapFlowRate1 = _futureLockedBalances.balance1
      .sub(_presentLockedBalances.balance1)
      .div(REFRESH_INTERVAL);

    setTwapFlowRate0(calcTwapFlowRate0);
    setTwapFlowRate1(calcTwapFlowRate1);

    if (BigNumber.from(_token1.flowRate).gt(0)) {
      setCurrentPrice(
        _reserves.reserve1.mul(1000).div(_reserves.reserve0).toNumber() / 1000
      );
      // setAveragePrice(
      //     decodedPresentLockedBalances.balance1.mul(1000).div(initialBalance0).toNumber() / 1000
      // );
    } else if (BigNumber.from(_token2.flowRate).gt(0)) {
      setCurrentPrice(
        _reserves.reserve0.mul(1000).div(_reserves.reserve1).toNumber() / 1000
      );
      // setAveragePrice(
      //     decodedPresentLockedBalances.balance0.mul(1000).div(initialBalance1).toNumber() / 1000
      // );
    }
  };

  const deleteSwap = async () => {
    starLoading()
    try {
      if (!token1) return;
      setIsDialogOpen(true)

      const pk = await Extension.showKey();

      const wallet = new ethers.Wallet(
        pk as string,
        api as ethers.providers.JsonRpcProvider
      );

      const contract = new ethers.Contract("0xcfa132e353cb4e398080b9700609bb008eceb125", cfaABI, wallet)

      const fee = await contract.estimateGas.deleteFlow(token1.address, selectedAccount.value.address, "0x0794c89b0767d480965574Af38052aab32496E00", "0x000000")
      const feeData = await api.getFeeData();

      const _gasLimit = fee;
      const _maxFeePerGas = feeData.maxFeePerGas as ethers.BigNumber;
      const _maxPriorityFeePerGas =
        feeData.maxPriorityFeePerGas as ethers.BigNumber;

      const avg = _maxFeePerGas.add(_maxPriorityFeePerGas).div(2);
      const estimatedTotal = avg.mul(_gasLimit);

      const estimatedFee = utils.formatEther(estimatedTotal.toString())
      setDeleteSwapFee(estimatedFee)

    } catch (error) {
      showErrorToast(error);
    }
    endLoading()
  }

  const confirmDeleteSwap = async () => {
    if (!token1) return;
    starLoading()
    try {
      const deleteFlowOperation = token1?.deleteFlow({
        sender: selectedAccount.value.address,
        receiver: EarningAssets[selectedChain?.name].contractAddress,
      });


      const privateKey = await Extension.showKey();

      const sf = await Framework.create({
        chainId: EarningAssets[selectedChain?.name].chainId,
        provider: api,
      });

      const signer = sf.createSigner({
        privateKey,
        provider: api,
      });



      const txnResponse = await deleteFlowOperation.exec(signer);
      await txnResponse.wait();

      showSuccessToast("Swap deleted successfully");
      navigate(EARNING)

    } catch (error) {
      showErrorToast(error)
    }
    endLoading()
  }

  useEffect(() => {
    if (!state?.asset) return;

    (async () => {
      try {
        const token1Name = state.asset;
        const token2Name =
          EarningAssets[selectedChain.name as "Polygon Testnet Mumbai"]
            .assetPairs[token1Name as "fDAIx" | "fUSDCx"][0];

        const sf = await Framework.create({
          chainId: EarningAssets[selectedChain?.name].chainId,
          provider: api,
        });

        const [token1, token2] = await Promise.all([
          sf.loadSuperToken(token1Name),
          sf.loadSuperToken(token2Name),
        ]);

        setToken1(token1);
        setToken2(token2);

        setToken1Name(token1Name);
        setToken2Name(token2Name);
        endLoading();
      } catch (error) {
        showErrorToast("error_loading_tokens");
      }
    })();
  }, [state]);

  useEffect(() => {
    if (!token1 || !token2) return;
    refreshFlowRate();
  }, [token1, token2]);

  useEffect(() => {
    if (!token1 || !token2) return;

    const timer = setTimeout(() => {
      setTime(time + 1);
      if (time >= REFRESH_INTERVAL) {
        setTime(0);
        refreshFlowRate();
      }

      // animate frame
      setCurrentBalance0((c) => c.add(flowRate0));
      setCurrentBalance1((c) => c.add(flowRate1));
      setCurrentTwapBalance0((c) => c.add(twapFlowRate0));
      setCurrentTwapBalance1((c) => c.add(twapFlowRate1));
    }, ANIMATION_MINIMUM_STEP_TIME);
    return () => {
      clearTimeout(timer);
    };
  }, [time, token1, token2]);

  return (
    <PageWrapper
      contentClassName="bg-[#29323C] h-full flex flex-col"
      innerContentClassName="flex flex-col"
    >

      <ConfirmDialog
        closeModal={() => setIsDialogOpen(false)}
        isOpen={isDialogOpen}
        isLoading={isLoading}
        fee={deleteSwapFee}
        description={t("delete_swap_description")}
        onAccept={confirmDeleteSwap}
      />


      <div className="flex justify-between items-center mb-7">
        <PageTitle
          title={t("title")}
          canNavigateBack
          containerClassName="!w-fit !mb-0"
        />
      </div>




      <div className="flex justify-between items-center gap-3 ">
        <p className="text-xl font-poppins">{`${token1Name} / ${token2Name}`}</p>
        <div>
          <button
            className="text-blue-600 hover:bg-gray-400 hover:bg-opacity-20 rounded-full p-2"
            onClick={() => {
              navigate(EARNING, {
                state: {
                  token: token1Name,
                }
              })
            }}
          >
            <BsPencil className="h-5 w-5" />
          </button>
          <button
            className="text-red-500 hover:bg-gray-400 hover:bg-opacity-20  rounded-full p-2"
            onClick={deleteSwap}
          >
            <AiFillDelete className="h-5 w-5" />
          </button>
        </div>
      </div>
      <PriceChart
        token1Name={token1Name}
        token2Name={token2Name}
        startDate={state.timestamp}
        token1={token1 as SuperToken}
        token2={token2 as SuperToken}
        currentPrice={currentPrice}
      />

      <div className="mb-3">
        <p className="font-inter text-lg">{t("total_amount_swapped")}:</p>

        <div className="flex gap-2 items-center mb-2 md:text-xl font-inter tracking-wider">
          <img
            src={ASSETS_INFO[token1Name as "fDAIx" | "fUSDCx"]?.image}
            alt=""
            width={20}
            height={20}
            className="object-contain rounded-full"
          />
          <p>-{utils.formatEther(currentBalance0).toString()}</p>
        </div>

        <div className="flex gap-2 items-center md:text-xl font-inter tracking-wider">
          <img
            src={ASSETS_INFO[token2Name as "fDAIx" | "fUSDCx"]?.image}
            alt=""
            width={20}
            height={20}
            className="object-contain rounded-full"
          />
          <p>+{utils.formatEther(currentTwapBalance1).toString()}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 bg-[#303943] rounded-xl p-4">
        <div className="flex justify-between items-center font-inter text-[#A3A3A3]">
          <p>{t("start_date")}:</p>
          <p>{format(state.timestamp, "dd/MM/yy")}</p>
        </div>

        <div className="flex justify-between items-center font-inter text-[#A3A3A3]">
          <p>
            {token1Name} {t("flow_rate")}:
          </p>
          <p>{utils.formatEther(state.flowRate as string).toString()}</p>
        </div>
      </div>


    </PageWrapper>
  );
};

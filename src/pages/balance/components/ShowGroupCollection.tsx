import { NFTContract } from "@src/types";
import { useLocation, useNavigate } from "react-router-dom";
import { HeaderBack } from "../../../components/common/HeaderBack";
import { PageWrapper } from "@src/components/common";
import { RiDeleteBinLine } from "react-icons/ri";
import { messageAPI } from "@src/messageAPI/api";
import { useNetworkContext } from "@src/providers";

export const ShowGroupCollection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const groups : any = location.state;
  const {
    state: { selectedChain },
  } = useNetworkContext();

  const deletecontract = async() => {
    try{
      await messageAPI.deleteContract({contractAddress:groups.contractAddress, networkId: groups.network, type: selectedChain[groups.network].type});
      navigate(-1);
    }
    catch(error){
      console.log("error: font",error)
    }
  }
  return (
    <PageWrapper contentClassName="mt-1/2 ">
      <div className="flex flex-col w-full">
        <HeaderBack title={groups.name} navigate={navigate} classNameContainer="justify-between"> 
          <button onClick={deletecontract}>
          <RiDeleteBinLine
                className="text-base"
                color="#FF0202"
                height="20px"
              />
          </button>
        </HeaderBack>
        <div className="flex justify-between flex-wrap gap-5 relative h-auto">
          {groups.data.map((_contract: NFTContract, index: number) => (
            <div
              key={index}
              className={`flex flex-col bg-[#212529] rounded-xl overflow-hidden w-[7rem] h-[8rem] cursor-pointer ${
                _contract.balance === 0 && "hidden"
              } `}
              onClick={() =>
                _contract?.isEnum &&
                navigate("/show-collection", { state: _contract })
              }
            >
              <div className=" !h-[14rem] w-full flex items-center justify-center">
                {_contract.nftsData && (
                  <img
                    src={
                      _contract.nftsData[0]?.image === "/" ||
                      !_contract.nftsData[0]?.image
                        ? "/icon-128.png"
                        : _contract.nftsData[0]?.image
                    }
                    alt="image"
                    className={`${
                      _contract.nftsData[0]?.image === "/" ||
                      !_contract.nftsData[0]?.image
                        ? "md:h-[3rem] h-[2rem] "
                        : "h-full w-full"
                    } object-cover`}
                  />
                )}
              </div>
              <div
                className={`w-full flex flex-col items-center ${
                  _contract.nftsData[0]?.image === "/" ||
                  !_contract.nftsData[0]?.image
                    ? ""
                    : "md:mt-[7rem] mt-[5rem]"
                }`}
              >
                <span>{_contract.collectionName}</span>
                <span>{`${_contract.balance} items`}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
};

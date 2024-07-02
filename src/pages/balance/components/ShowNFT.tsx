import { HeaderBack } from "@src/components/common";
import { PageWrapper } from "@src/components/common/PageWrapper";
import { useNavigate } from "react-router-dom";

export const ShowNFT = () => {
    const navigate = useNavigate()
  return (
    <PageWrapper>
        <HeaderBack  navigate={navigate} title=""/>
        <div className="flex flex-col"></div>

    </PageWrapper>
  );
};
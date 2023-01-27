import { useNavigate } from "react-router-dom";
import { BsFillUnlockFill } from "react-icons/bs";

export const DecryptFAB = () => {
  const navigate = useNavigate();

  const openTab = () => {
    navigate("/decrypt");
  };

  return (
    <button
      className="rounded-full drop-shadow-lg flex justify-center items-center"
      onClick={openTab}
    >
      <BsFillUnlockFill />
    </button>
  );
};

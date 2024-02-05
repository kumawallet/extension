import { useNavigate } from "react-router-dom";
import { FooterIcon } from "./FooterIcon"
import { SIGNIN } from "@src/routes/paths";
import { MdOutlineLock } from "react-icons/md";
import { messageAPI } from "@src/messageAPI/api";

export const SignOut = () => {
  const navigate = useNavigate();

  const signOut = async () => {
    await messageAPI.signOut()
    // await Extension.signOut();
    navigate(SIGNIN);
  };

  return (
    <FooterIcon
      icon={MdOutlineLock}
      onClick={signOut}
    />
  )
}
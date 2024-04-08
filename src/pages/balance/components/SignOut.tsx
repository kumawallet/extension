import { useNavigate } from "react-router-dom";
import { FooterIcon } from "./FooterIcon"
import { SIGNIN } from "@src/routes/paths";
import { MdOutlineLock } from "react-icons/md";
import { messageAPI } from "@src/messageAPI/api";
import { Padlock } from "@src/components/icons/Padlock"

export const SignOut = () => {
  const navigate = useNavigate();

  const signOut = async () => {
    await messageAPI.signOut()
    navigate(SIGNIN);
  };

  return (
    <button onClick={signOut}>
      <Padlock size="25" color="#B0B0CE"/>
    </button>
  )
}
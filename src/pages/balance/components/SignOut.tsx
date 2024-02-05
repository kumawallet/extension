import { useNavigate } from "react-router-dom";
import { FooterIcon } from "./FooterIcon"
import Extension from "@src/Extension";
import { SIGNIN } from "@src/routes/paths";
import { MdOutlineLock } from "react-icons/md";

export const SignOut = () => {
  const navigate = useNavigate();

  const signOut = async () => {
    await Extension.signOut();
    navigate(SIGNIN);
  };

  return (
    <FooterIcon
      icon={MdOutlineLock}
      onClick={signOut}
    />
  )
}
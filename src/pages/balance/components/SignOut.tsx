import { useNavigate } from "react-router-dom";
import { SIGNIN } from "@src/routes/paths";
import { messageAPI } from "@src/messageAPI/api";
import { Padlock } from "@src/components/icons/Padlock"

export const SignOut = () => {
  const navigate = useNavigate();

  const signOut = async () => {
    await messageAPI.signOut()
    navigate(SIGNIN);
  };

  return (
    <button data-testid="sign-out" onClick={signOut}>
      <Padlock size="25" color="#B0B0CE" />
    </button>
  )
}
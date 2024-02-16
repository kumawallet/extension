import { useSteps } from "@src/hooks";
import { messageAPI } from "@src/messageAPI/api";
import { BALANCE, WELCOME } from "@src/routes/paths";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const STEPS = [1, 2, 3, 4];

export const useCreateWallet = () => {
  const navigate = useNavigate();
  const { nextStep, prevStep, step } = useSteps(STEPS);

  const [alreadySignedUp, setAlreadySignUp] = useState(false);

  useEffect(() => {
    (async () => {
      const isSignUp = await messageAPI.alreadySignedUp();
      setAlreadySignUp(isSignUp);
    })();
  }, []);

  const goToWelcome = () => {
    navigate(alreadySignedUp ? BALANCE : WELCOME);
  };

  return {
    nextStep,
    prevStep,
    step,
    goToWelcome,
  };
};

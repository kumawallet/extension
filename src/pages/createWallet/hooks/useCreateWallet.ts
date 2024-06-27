import { useSteps } from "@src/hooks";
import { WELCOME } from "@src/routes/paths";
import { useNavigate } from "react-router-dom";

const STEPS = [1, 2, 3, 4];

export const useCreateWallet = (steps = STEPS) => {
  const navigate = useNavigate();
  const { nextStep, prevStep, step, setStep } = useSteps(steps);

  const goToWelcome = () => {
    navigate(WELCOME);
  };

  return {
    nextStep,
    prevStep,
    step,
    goToWelcome,
    setStep,
  };
};

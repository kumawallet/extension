import { useState } from "react";

export const useSteps = (steps: number[]) => {
  const maxStep = steps[steps.length - 1];

  const [step, setStep] = useState(steps[0]);

  const nextStep = () => {
    if (step < maxStep) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > steps[0]) {
      setStep(step - 1);
    }
  };

  return {
    step,
    nextStep,
    prevStep,
    setStep,
  };
};

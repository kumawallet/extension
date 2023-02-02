import { toast } from "react-toastify";

export const useToast = () => {
  const showErrorToast = (message: string) => {
    toast.error(message, {
      position: toast.POSITION.TOP_CENTER,
      autoClose: false,
      className: "toast",
    });
  };

  return {
    showErrorToast,
  };
};

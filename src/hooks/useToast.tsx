import { toast } from "react-toastify";

export const useToast = () => {
  const showErrorToast = (message: string) => {
    toast.error(String(message), {
      position: toast.POSITION.TOP_CENTER,
      autoClose: false,
      className: "toast",
      toastId: "TOAST_ERROR",
    });
  };

  return {
    showErrorToast,
  };
};

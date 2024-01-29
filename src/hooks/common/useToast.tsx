import { toast } from "react-toastify";

export const useToast = () => {
  const showErrorToast = (message: string | unknown) => {
    toast.error(String(message), {
      position: 'top-center',
      className: "toast",
      toastId: "TOAST_ERROR",
    });
  };

  const showSuccessToast = (message: string) => {
    toast.success(String(message), {
      position: 'top-center',
      className: "toast",
      toastId: "TOAST_SUCCESS",
    });
  };

  return {
    showErrorToast,
    showSuccessToast,
  };
};

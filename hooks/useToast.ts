import { useState } from "react";

export interface ToastState {
  show: boolean;
  message: string;
  type: "success" | "error";
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({
      show: true,
      message,
      type,
    });

    setTimeout(() => {
      setToast({
        show: false,
        message: "",
        type: "success",
      });
    }, 4000);
  };

  return {
    toast,
    setToast,
    showToast,
  };
}
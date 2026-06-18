import { createContext, useContext, useState } from "react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({
    open: false,
    type: "success",
    message: "",
  });

  const showToast = (type, message) => {
    setToast({
      open: true,
      type,
      message,
    });

    setTimeout(() => {
      setToast({
        open: false,
        type: "success",
        message: "",
      });
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {toast.open && (
        <div
          className={`fixed top-5 right-5 z-[99999] px-5 py-3 rounded-lg shadow-lg text-white font-medium transition-all ${
            toast.type === "success"
              ? "bg-green-600"
              : toast.type === "error"
              ? "bg-red-600"
              : "bg-blue-600"
          }`}
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
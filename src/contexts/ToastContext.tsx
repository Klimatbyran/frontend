import React, { createContext, useContext, useState } from "react";
import * as Toast from "@radix-ui/react-toast";

export interface ToastContext {
  showToast: (title: string, message: string) => void;
}

const ToastContext = createContext<ToastContext>({} as ToastContext);

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");

  const showToast = (title: string, message: string) => {
    setTitle(title);
    setMessage(message);
    setOpen(true);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast.Provider>
        <Toast.Root
          open={open}
          onOpenChange={setOpen}
          className="bg-black-1 border p-4 w-80 rounded-lg shadow-lg"
        >
          <Toast.Title className="font-bold text-green-3">{title}</Toast.Title>
          <Toast.Description className="mt-2">{message}</Toast.Description>
        </Toast.Root>
        <Toast.Viewport className="fixed top-[60px] right-4 flex flex-col gap-3 z-100" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
};

"use client";

import ReduxProvider from "@/redux/ReduxProvider";
// import ReduxProvider from "@/redux/ReduxProvider";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { Toaster } from "sonner";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ReduxProvider>
        {children}
        <Toaster
          position="top-center"
          theme="dark"
          richColors
          closeButton
          duration={3500}
          toastOptions={{
            style: {
              background: "#18181b",
              border: "1px solid rgba(251, 163, 15, 0.25)",
              color: "#ffffff",
              borderRadius: "14px",
              boxShadow:
                "0 14px 35px rgba(0, 0, 0, 0.8), 0 0 15px rgba(251, 163, 15, 0.12)",
              fontSize: "14px",
              fontFamily: "var(--font-geist-sans), sans-serif",
              padding: "14px 16px",
            },
            classNames: {
              toast: "font-sans select-none",
              title: "font-semibold text-sm",
              description: "text-zinc-400 text-xs mt-0.5",
              actionButton:
                "!bg-gradient-to-r !from-[#FBA30F] !to-[#D25A00] !text-white !font-medium !rounded-lg",
              cancelButton: "!bg-zinc-800 !text-white !rounded-lg",
              closeButton:
                "!bg-[#242424] !border-white/10 !text-zinc-400 hover:!text-white hover:!bg-[#2e2e2e]",
              success:
                "!bg-[#141d17] !border-emerald-500/40 !text-emerald-300",
              error: "!bg-[#201416] !border-rose-500/40 !text-rose-300",
              info: "!bg-[#131b24] !border-sky-500/40 !text-sky-300",
              warning:
                "!bg-[#221b12] !border-amber-500/40 !text-amber-300",
            },
          }}
        />
      </ReduxProvider>
    </SessionProvider>
  );
}

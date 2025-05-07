import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-black-3 flex flex-col">
      <Header />
      <main className="grow w-screen p-0">
        {children}
      </main>
      <Footer />
    </div>
  );
}

import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-black-3 flex flex-col">
      <Header />
      <main className="grow container mx-auto px-4 pt-24 pb-12">
        {children}
      </main>
      <Footer />
    </div>
  );
}

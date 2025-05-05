import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ScrollToTop } from "./ScrollToTop";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-black-3 flex flex-col">
      <Header />
      <main className="grow container mx-auto px-4 pt-24 pb-12">
        {children}
        <ScrollToTop />
      </main>
      <Footer />
    </div>
  );
}

import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ScrollToTop } from "./ScrollToTop";
import { SuggestEdit } from "./SuggestEdit";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-black-3 flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 pt-24 pb-12 min-h-0">
        {children}
        <ScrollToTop />
        <SuggestEdit />
      </main>
      <Footer />
    </div>
  );
}

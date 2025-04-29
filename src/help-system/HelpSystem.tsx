import { createContext, useContext, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { HelpItem, HelpItemId, helpItems } from "./items";

export interface HelpSystemContext {
  openHelp: (title: string, items: HelpItemId[]) => void;
}

const HelpSystemContext = createContext<HelpSystemContext>({
  openHelp: () => {},
});

export const useHelpSystem = () => {
  const context = useContext(HelpSystemContext);
  if (!context) {
    throw new Error("useHelpSystem must be used within a HelpSystemProvider");
  }
  return context;
};

export const HelpSystemProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<HelpItem[]>([]);
  const [title, setTitle] = useState("");

  const showHelp = (title: string, items: HelpItemId[]) => {
    setTitle(title);

    setItems(items.map((sId) => helpItems[sId]).filter((s) => s !== undefined));
    setOpen(true);
  };

  // Only show the item titles if there are more than one
  const showItemTitles = items.length > 1;

  return (
    <HelpSystemContext.Provider value={{ openHelp: showHelp }}>
      {children}
      <Dialog open={open} modal onOpenChange={() => setOpen(!open)}>
        <DialogPortal>
          <DialogOverlay className="fixed inset-0 bg-gray-500/50" />
          <DialogContent className="border-white bg-black">
            <DialogTitle>
              <h1 className="text-2xl mb-1.25">{title}</h1>
            </DialogTitle>
            {items.map(({ id, title: itemTitle, component: C }) => (
              <section key={id}>
                {showItemTitles && (
                  <h2 className="text-xl mt-4 font-bold">{itemTitle}</h2>
                )}
                <C key={id} />
              </section>
            ))}
          </DialogContent>
        </DialogPortal>
      </Dialog>
      {/* show a modal */}
    </HelpSystemContext.Provider>
  );
};

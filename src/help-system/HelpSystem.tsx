import { createContext, useContext, useState } from "react";
import { HelpItem, HelpItemId, helpItems } from "./items";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { Button } from "@/components/ui/button";

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
  const [selectedItems, setSelectedItems] = useState<HelpItem[]>([]);
  const [title, setTitle] = useState("");

  const showHelp = (title: string, showIds: HelpItemId[]) => {
    setTitle(title);

    setSelectedItems(
      showIds.length > 0
        ? showIds.map((sId) => helpItems[sId]).filter((s) => s !== undefined)
        : Object.values(helpItems),
    );
    setOpen(true);
  };

  console.log("Rerender", selectedItems);

  return (
    <HelpSystemContext.Provider value={{ openHelp: showHelp }}>
      <div
        className={cn("transition-all duration-300", open ? "mr-[300px]" : "")}
      >
        {children}
      </div>
      <Button
        size="sm"
        className="fixed top-1/2 transform -rotate-90 origin-bottom-right right-0 bg-gray-800 rounded-none"
        onClick={() => showHelp("Data Guide", [])}
      >
        Data Guide
      </Button>
      <div className={cn("relative", open ? "w-[300px]" : "")}>
        <div
          className={cn(
            "p-4 bg-gray-800 w-[300px] fixed top-[50px] right-0 h-screen flex flex-col gap-4 transition-all duration-300",
            open ? "" : "translate-x-full",
          )}
        >
          <Sidebar
            items={selectedItems}
            onClose={() => setOpen(!open)}
            title={title}
          />
        </div>
      </div>
    </HelpSystemContext.Provider>
  );
};

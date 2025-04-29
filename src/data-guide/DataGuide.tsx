import { createContext, useCallback, useContext, useState } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { Button } from "@/components/ui/button";

export interface DataGuideContext {
  openHelp: (filter: string) => void;
}

const DataGuideContext = createContext<DataGuideContext>({
  openHelp: () => {},
});

export const useDataGuide = () => {
  const context = useContext(DataGuideContext);
  if (!context) {
    throw new Error("useDataGuide must be used within a DataGuideProvider");
  }
  return context;
};

export const DataGuideProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [initialFilter, setInitialFilter] = useState("");

  // Used to force new sidebar content when openHelp is called
  const [forceSidebarUpdateId, setForceSidebarUpdateId] = useState("");

  const openHelp = useCallback((filter: string) => {
    setInitialFilter(filter);
    setOpen(true);
    setForceSidebarUpdateId(Math.floor(Math.random() * 100000).toString());
  }, []);

  console.log("Rerender:", forceSidebarUpdateId);

  return (
    <DataGuideContext.Provider value={{ openHelp }}>
      <div
        className={cn("transition-all duration-300", open ? "mr-[300px]" : "")}
      >
        {children}
      </div>
      <Button
        size="sm"
        className={cn(
          "fixed top-1/2 transform -rotate-90 origin-bottom-right right-0 bg-gray-800 rounded-none transition-all duration-300",
          open ? "mr-[300px]" : "",
        )}
        onClick={() => setOpen(!open)}
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
            key={forceSidebarUpdateId}
            initialFilter={initialFilter}
            onClose={() => setOpen(!open)}
          />
        </div>
      </div>
    </DataGuideContext.Provider>
  );
};

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PinMode } from "@/components/nation/story/usePinnedSteps";

type StoryStageContextValue = {
  isOnStage: boolean;
  setStagePinned: (stageId: string, pinned: boolean) => void;
};

const StoryStageContext = createContext<StoryStageContextValue | null>(null);

export function StoryStageProvider({ children }: { children: ReactNode }) {
  const [pinnedStages, setPinnedStages] = useState<Set<string>>(
    () => new Set(),
  );

  const setStagePinned = useCallback((stageId: string, pinned: boolean) => {
    setPinnedStages((current) => {
      const hasStage = current.has(stageId);
      if (pinned === hasStage) return current;

      const next = new Set(current);
      if (pinned) next.add(stageId);
      else next.delete(stageId);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      isOnStage: pinnedStages.size > 0,
      setStagePinned,
    }),
    [pinnedStages, setStagePinned],
  );

  return (
    <StoryStageContext.Provider value={value}>
      {children}
    </StoryStageContext.Provider>
  );
}

function useStoryStageContext() {
  const context = useContext(StoryStageContext);
  if (!context) {
    throw new Error(
      "useStoryStageContext must be used within StoryStageProvider",
    );
  }
  return context;
}

export function useStoryStageVisible() {
  return useStoryStageContext().isOnStage;
}

/** Report whether a scroll-pinned story section is actively fixed on screen. */
export function useReportStoryStage(stageId: string, mode: PinMode) {
  const { setStagePinned } = useStoryStageContext();
  const pinned = mode === "pinned";

  useEffect(() => {
    setStagePinned(stageId, pinned);
    return () => setStagePinned(stageId, false);
  }, [stageId, pinned, setStagePinned]);
}

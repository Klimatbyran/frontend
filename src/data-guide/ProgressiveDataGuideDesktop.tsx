import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { DataGuideItemId } from "./items";
import { DataGuideMarkdown } from "./DataGuideMarkdown";

export type NonEmptyArray<T> = [T, ...T[]];
interface ProgressiveDataGuideDesktopProps {
  items: NonEmptyArray<DataGuideItemId>;
}

function useContentHeightAnimation(
  contentRef: React.RefObject<HTMLDivElement | null>,
  activeItemId: DataGuideItemId,
) {
  useEffect(() => {
    if (!contentRef.current) return;
    const element = contentRef.current;

    requestAnimationFrame(() => {
      const currentHeight = element.offsetHeight;
      element.style.height = "auto";
      const newHeight = element.scrollHeight;
      element.style.height = `${currentHeight}px`;

      requestAnimationFrame(() => {
        element.style.height = `${newHeight}px`;
      });
    });
  }, [activeItemId, contentRef]);
}

function DataGuideNavigation({
  items,
  activeItemId,
  isTransitioning,
  onItemChange,
  t,
}: {
  items: NonEmptyArray<DataGuideItemId>;
  activeItemId: DataGuideItemId;
  isTransitioning: boolean;
  onItemChange: (id: DataGuideItemId) => void;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <div className="space-y-1">
      {items.map((itemId) => (
        <div
          key={itemId}
          className={cn(activeItemId === itemId && "border-l-2 border-blue-2")}
        >
          <button
            onClick={() => onItemChange(itemId)}
            disabled={isTransitioning}
            className={cn(
              "flex w-full py-1.5 px-2 items-center rounded-md hover:bg-black-1/70 transition-colors text-left disabled:pointer-events-none",
              activeItemId === itemId
                ? "text-white font-bold"
                : "text-white/70",
            )}
          >
            <span>{t(`${itemId}.title`)}</span>
          </button>
        </div>
      ))}
    </div>
  );
}

function DataGuideContent({
  activeItemId,
  isTransitioning,
  contentRef,
  t,
}: {
  activeItemId: DataGuideItemId;
  isTransitioning: boolean;
  contentRef: React.RefObject<HTMLDivElement | null>;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <div className="p-8 bg-black-1/60 rounded-3xl overflow-hidden">
      <div
        ref={contentRef}
        className={cn(
          "text-gray-300 leading-relaxed transition-all duration-300 ease-in-out",
          isTransitioning
            ? "opacity-0 transform translate-y-2"
            : "opacity-100 transform translate-y-0",
        )}
        style={{
          transition:
            "opacity 300ms ease-in-out, transform 300ms ease-in-out, height 300ms ease-in-out",
        }}
      >
        <h2 className="text-lg font-bold mb-4">{t(`${activeItemId}.title`)}</h2>
        <DataGuideMarkdown item={activeItemId} className="max-w-prose" />
      </div>
    </div>
  );
}

export function ProgressiveDataGuideDesktop({
  items,
}: ProgressiveDataGuideDesktopProps) {
  const { t } = useTranslation("dataguideItems");
  const [activeItemId, setActiveItemId] = useState<DataGuideItemId>(items[0]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleItemChange = (newItemId: DataGuideItemId) => {
    if (newItemId === activeItemId) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveItemId(newItemId);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 150);
  };

  useContentHeightAnimation(contentRef, activeItemId);

  return (
    <div className="py-8 mt-2 grid grid-cols-[1fr_2fr] gap-8 min-h-[300px] font-thin">
      <DataGuideNavigation
        items={items}
        activeItemId={activeItemId}
        isTransitioning={isTransitioning}
        onItemChange={handleItemChange}
        t={t}
      />
      <DataGuideContent
        activeItemId={activeItemId}
        isTransitioning={isTransitioning}
        contentRef={contentRef}
        t={t}
      />
    </div>
  );
}

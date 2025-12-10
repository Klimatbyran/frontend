import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { DataGuideItemId } from "./items";
import { DataGuideMarkdown } from "./DataGuideMarkdown";

export type NonEmptyArray<T> = [T, ...T[]];
interface ProgressiveDataGuideDesktopProps {
  items: NonEmptyArray<DataGuideItemId>;
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

    // Fade out, then change content, then fade in
    setTimeout(() => {
      setActiveItemId(newItemId);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 150);
  };

  useEffect(() => {
    if (contentRef.current) {
      const element = contentRef.current;

      // Use requestAnimationFrame to ensure smooth transition
      requestAnimationFrame(() => {
        // Temporarily set height to auto to get true content height
        const currentHeight = element.offsetHeight;
        element.style.height = "auto";
        const newHeight = element.scrollHeight;

        // Set back to current height immediately to avoid flash
        element.style.height = `${currentHeight}px`;

        // Then animate to new height on next frame
        requestAnimationFrame(() => {
          element.style.height = `${newHeight}px`;
        });
      });
    }
  }, [activeItemId]);

  return (
    <div className="py-8 mt-2 grid grid-cols-[1fr_2fr] gap-8 min-h-[300px] font-thin">
      {/* Left column - Navigation */}
      <div className="space-y-1">
        {items.map((itemId) => {
          return (
            <div
              className={cn(
                activeItemId === itemId && "border-l-2 border-blue-2",
              )}
            >
              <button
                key={itemId}
                onClick={() => handleItemChange(itemId)}
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
          );
        })}
      </div>

      {/* Right column - Content */}
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
          <h2 className="text-lg font-bold mb-4">
            {t(`${activeItemId}.title`)}
          </h2>
          <DataGuideMarkdown item={activeItemId} className="max-w-prose" />
        </div>
      </div>
    </div>
  );
}

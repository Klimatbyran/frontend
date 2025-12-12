import { Text } from "@/components/ui/text";
import { LocalizedLink } from "@/components/LocalizedLink";
import { useTranslation } from "react-i18next";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { DataGuideItemId } from "@/data-guide/items";
import { useEffect, useRef } from "react";

interface MunicipalityListBoxProps {
  municipalities: string[];
  helpItems?: DataGuideItemId[];
  translateNamespace?: string;
}

export function MunicipalityListBox({
  municipalities,
  helpItems = [],
  translateNamespace = "detailPage",
}: MunicipalityListBoxProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateBulletVisibility = () => {
      if (!containerRef.current) return;

      const items = containerRef.current.children;
      for (let i = 1; i < items.length; i++) {
        const currentItem = items[i] as HTMLElement;
        const previousItem = items[i - 1] as HTMLElement;
        const bullet = currentItem.querySelector(
          ".bullet-separator",
        ) as HTMLElement;

        if (bullet) {
          const currentTop = currentItem.offsetTop;
          const previousTop = previousItem.offsetTop;
          const isAtStartOfLine = currentTop > previousTop;

          if (isAtStartOfLine) {
            bullet.style.display = "none";
          } else {
            bullet.style.display = "";
          }
        }
      }
    };

    updateBulletVisibility();

    const resizeObserver = new ResizeObserver(updateBulletVisibility);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [municipalities]);

  if (municipalities.length === 0) {
    return null;
  }

  const content = (
    <div className="bg-black-2 rounded-level-3 p-4 md:p-8">
      <Text variant="h3" className="mb-4 md:mb-6">
        {t(`${translateNamespace}.municipalities`)}
      </Text>
      <div className="flex flex-wrap" ref={containerRef}>
        {municipalities.map((municipality, index) => (
          <span key={municipality} className="inline-flex items-center">
            {index > 0 && (
              <span className="bullet-separator text-grey mx-2">•</span>
            )}
            <LocalizedLink
              to={`/municipalities/${municipality}`}
              className="text-orange-2 hover:text-orange-1 underline text-sm md:text-base"
            >
              {municipality}
            </LocalizedLink>
          </span>
        ))}
      </div>
    </div>
  );

  if (helpItems.length > 0) {
    return <SectionWithHelp helpItems={helpItems}>{content}</SectionWithHelp>;
  }

  return content;
}

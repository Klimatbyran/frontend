import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { methodologySections } from "@/lib/methods/methodologyData";
import { useScreenSize } from "@/hooks/useScreenSize";

interface MethodologyNavigationProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
  contentRef: React.RefObject<HTMLDivElement>;
}

export function MethodologyNavigation({
  selectedMethod,
  onMethodChange,
  contentRef,
}: MethodologyNavigationProps) {
  const { t } = useTranslation();
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    Object.keys(methodologySections),
  );
  const { isMobile } = useScreenSize();

  useEffect(() => {
    if (isMobile) {
      setExpandedCategories([]);
    } else {
      setExpandedCategories(Object.keys(methodologySections));
    }
  }, [isMobile]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category],
    );
  };

  // Scroll to MethodContent on mobile when a method is selected
  const handleMethodChange = (method: string) => {
    onMethodChange(method);
    if (isMobile && contentRef?.current) {
      setTimeout(() => {
        if (!contentRef.current) return;
        const headerHeight = window.innerWidth >= 1024 ? 48 : 40; // 48px for lg, 40px for mobile
        const rect = contentRef.current.getBoundingClientRect();
        const scrollTo = rect.top + window.scrollY - headerHeight;
        window.scrollTo({ top: scrollTo, behavior: "smooth" });
      }, 350);
    }
  };

  return (
    <nav
      aria-label="Methodology Navigation"
      className="bg-black-2 rounded-md p-2"
    >
      <h2 className="sr-only">{t("methodsPage.dataSelector.label")}</h2>

      <ul className="divide-y divide-black-1">
        {Object.entries(methodologySections).map(([category, methods]) => (
          <li key={category}>
            <button
              onClick={() => toggleCategory(category)}
              className="flex justify-between items-center w-full p-3 my-1 text-left font-medium text-white hover:bg-black-1 transition-colors duration-200 rounded-lg"
              aria-expanded={expandedCategories.includes(category)}
            >
              <span>{t(`methodsPage.categories.${category}`)}</span>
              {expandedCategories.includes(category) ? (
                <ChevronUp size={18} className="text-grey" />
              ) : (
                <ChevronDown size={18} className="text-grey" />
              )}
            </button>

            {expandedCategories.includes(category) && (
              <ul className="pl-4 pb-2 animate-slideDown">
                {methods.map((method) => (
                  <li key={method.id}>
                    <button
                      onClick={() => handleMethodChange(method.id)}
                      className={`w-full p-2 my-0.5 text-left text-sm rounded-lg transition-colors duration-200 ${
                        selectedMethod === method.id
                          ? "bg-black-1 text-blue-3 font-medium"
                          : "text-grey hover:bg-black-1 hover:text-white"
                      }`}
                      aria-current={
                        selectedMethod === method.id ? "page" : undefined
                      }
                    >
                      {t(`methodsPage.${category}.${method.id}.title`)}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

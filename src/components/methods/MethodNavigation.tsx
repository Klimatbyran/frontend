import { useTranslation } from "react-i18next";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { methodologySections } from "@/lib/methods/methodologyData";

interface MethodologyNavigationProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
}

export function MethodologyNavigation({
  selectedMethod,
  onMethodChange,
}: MethodologyNavigationProps) {
  const { t } = useTranslation();
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    Object.keys(methodologySections),
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category],
    );
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
              className="flex justify-between items-center w-full p-4 text-left font-medium text-white hover:bg-black-1 transition-colors duration-200 rounded-lg"
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
                      onClick={() => onMethodChange(method.id)}
                      className={`w-full p-2 text-left text-sm rounded-lg transition-colors duration-200 ${
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

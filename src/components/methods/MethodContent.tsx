import { useTranslation } from "react-i18next";
import { useState, useEffect, forwardRef } from "react";
import { getMethodById } from "@/lib/methods/methodologyData";
import { getMethodContentComponent } from "./methodContentRegistry";

interface MethodologyContentProps {
  method: string;
}

export const MethodologyContent = forwardRef<
  HTMLDivElement,
  MethodologyContentProps
>(({ method }, ref) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);
  const methodData = getMethodById(method);

  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [method]);

  if (!methodData) {
    return (
      <div className="card-dark">
        <p className="text-grey">{t("methodsPage.methodNotFound")}</p>
      </div>
    );
  }

  const ContentComponent = getMethodContentComponent(method);

  return (
    <div
      ref={ref}
      id="methodology-content"
      className={`transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
    >
      <div className="bg-black-2 rounded-level-2 p-4 pt-6 sm:p-8 md:p-16">
        <div className="border-b border-black-1 pb-6 mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            {t(`methodsPage.${methodData.category}.${method}.title`)}
          </h1>
          <p className="text-grey">
            {t(`methodsPage.${methodData.category}.${method}.description`)}
          </p>
        </div>
        <div className="prose prose-invert max-w-none">
          {ContentComponent ? <ContentComponent /> : null}
        </div>
      </div>
    </div>
  );
});

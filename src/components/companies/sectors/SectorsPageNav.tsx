import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export type SectorSectionId = "distribution" | "trends" | "sources";

interface SectorsPageNavProps {
  activeSection: SectorSectionId;
  onSectionChange: (section: SectorSectionId) => void;
}

const SECTIONS: SectorSectionId[] = ["distribution", "trends", "sources"];

export function SectorsPageNav({
  activeSection,
  onSectionChange,
}: SectorsPageNavProps) {
  const { t } = useTranslation();

  const scrollToSection = (section: SectorSectionId) => {
    onSectionChange(section);
    document
      .getElementById(`sector-section-${section}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      aria-label={t("sectorsOverviewPage.nav.label")}
      className="flex gap-1 overflow-x-auto pb-1 mb-4 scrollbar-hide"
    >
      {SECTIONS.map((section) => (
        <button
          key={section}
          type="button"
          onClick={() => scrollToSection(section)}
          className={cn(
            "shrink-0 px-4 py-2 rounded-lg text-sm transition-colors",
            activeSection === section
              ? "bg-blue-5/30 text-blue-2"
              : "text-grey hover:text-white hover:bg-black-2",
          )}
        >
          {t(`sectorsOverviewPage.nav.${section}`)}
        </button>
      ))}
    </nav>
  );
}

interface SectorSectionProps {
  id: SectorSectionId;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export function SectorSection({
  id,
  title,
  subtitle,
  children,
  action,
}: SectorSectionProps) {
  return (
    <section
      id={`sector-section-${id}`}
      className="scroll-mt-24 bg-black-2 rounded-lg border border-black-1 p-4 md:p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-light text-white">{title}</h2>
          {subtitle && <p className="text-sm text-grey mt-1">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

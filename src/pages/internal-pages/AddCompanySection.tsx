import { useTranslation } from "react-i18next";

interface AddCompanySectionProps {
  titleKey: string;
  children: React.ReactNode;
}

export function AddCompanySection({
  titleKey,
  children,
}: AddCompanySectionProps) {
  const { t } = useTranslation();
  return (
    <section className="mb-8 rounded-lg bg-black-2 p-6">
      <h2 className="text-lg font-semibold mb-6 text-blue-3">{t(titleKey)}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

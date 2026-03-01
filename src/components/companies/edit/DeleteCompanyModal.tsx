import { useTranslation } from "react-i18next";
import type { CompanyDetails } from "@/types/company";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Text } from "@/components/ui/text";

interface DeleteCompanyModalProps {
  isOpen: boolean;
  company: CompanyDetails | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteSummary({ company }: { company: CompanyDetails }) {
  const { t } = useTranslation();
  const periodsCount = company.reportingPeriods?.length ?? 0;
  const goalsCount = company.goals?.length ?? 0;
  const initiativesCount = company.initiatives?.length ?? 0;
  const industryName =
    company.industry?.industryGics?.en?.industryName ??
    company.industry?.industryGics?.sv?.industryName ??
    null;
  const baseYear = company.baseYear?.year ?? null;

  const items: string[] = [];
  if (periodsCount > 0) {
    items.push(
      t("companyEditPage.deleteCompany.summary.reportingPeriods", {
        count: periodsCount,
      }),
    );
  }
  if (industryName) {
    items.push(
      t("companyEditPage.deleteCompany.summary.industry", {
        name: industryName,
      }),
    );
  }
  if (baseYear) {
    items.push(
      t("companyEditPage.deleteCompany.summary.baseYear", { year: baseYear }),
    );
  }
  if (goalsCount > 0) {
    items.push(
      t("companyEditPage.deleteCompany.summary.goals", { count: goalsCount }),
    );
  }
  if (initiativesCount > 0) {
    items.push(
      t("companyEditPage.deleteCompany.summary.initiatives", {
        count: initiativesCount,
      }),
    );
  }
  if (items.length === 0) {
    items.push(t("companyEditPage.deleteCompany.summary.noData"));
  }

  return (
    <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export function DeleteCompanyModal({
  isOpen,
  company,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteCompanyModalProps) {
  const { t } = useTranslation();

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="bg-black-2 border-2 border-grey/50 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_25px_50px_-12px_rgba(0,0,0,0.5)]">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("companyEditPage.deleteCompany.title")}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              <Text variant="body" className="mb-2">
                {t("companyEditPage.deleteCompany.description")}
              </Text>
              {company && (
                <>
                  <div className="mt-4 p-3 rounded-lg bg-black-1 space-y-1">
                    <p className="text-sm font-medium text-white">
                      {t("companyEditPage.deleteCompany.wikidataId")}:{" "}
                      <code className="text-grey">{company.wikidataId}</code>
                    </p>
                    <p className="text-sm font-medium text-white">
                      {t("companyEditPage.deleteCompany.name")}: {company.name}
                    </p>
                  </div>
                  <p className="text-sm font-medium mt-3 text-white">
                    {t("companyEditPage.deleteCompany.dataToDelete")}
                  </p>
                  <DeleteSummary company={company} />
                </>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {t("companyEditPage.deleteCompany.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting
              ? t("companyEditPage.deleteCompany.deleting")
              : t("companyEditPage.deleteCompany.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

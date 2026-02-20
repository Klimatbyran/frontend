import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Text } from "@/components/ui/text";

interface UnsavedChangesModalProps {
  isOpen: boolean;
  companyWikidataId: string;
  onClose: () => void;
}

export function UnsavedChangesModal({
  isOpen,
  companyWikidataId,
  onClose,
}: UnsavedChangesModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-black-2 p-6 rounded-lg max-w-md w-full">
        <p
          className="tracking-tight text-4xl font-light mb-4"
          data-testid="unsaved-changes-title"
        >
          {t("companyEditPage.unsavedChanges.title")}
        </p>
        <Text variant="body" className="mb-6">
          {t("companyEditPage.unsavedChanges.description")}
        </Text>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-black-1 hover:bg-black-2 transition-colors"
          >
            {t("companyEditPage.unsavedChanges.cancel")}
          </button>
          <button
            onClick={() => navigate(`/companies/${companyWikidataId}`)}
            className="px-4 py-2 rounded-lg bg-pink-5 hover:bg-pink-6 transition-colors"
          >
            {t("companyEditPage.unsavedChanges.discard")}
          </button>
        </div>
      </div>
    </div>
  );
}

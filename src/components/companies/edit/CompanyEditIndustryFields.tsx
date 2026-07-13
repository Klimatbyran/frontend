import { Undo2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type {
  CompanyDetails as CompanyDetailsType,
  GicsOption,
} from "@/types/company";
import { IconCheckbox } from "@/components/ui/icon-checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface GicsSubIndustryFieldProps {
  company: CompanyDetailsType;
  subIndustryCode: string;
  setSubIndustryCode: (value: string) => void;
  industryVerified: boolean;
  setIndustryVerified: (value: boolean) => void;
  gicsOptions: GicsOption[];
  gicsLoading: boolean;
  gicsError: string | null;
  industryIsDisabled: boolean;
  industryBadgeIconClass: string;
  industryLoading: boolean;
}

export function GicsSubIndustryField({
  company,
  subIndustryCode,
  setSubIndustryCode,
  industryVerified,
  setIndustryVerified,
  gicsOptions,
  gicsLoading,
  gicsError,
  industryIsDisabled,
  industryBadgeIconClass,
  industryLoading,
}: GicsSubIndustryFieldProps) {
  const { t } = useTranslation();
  const originalSubIndustryCode =
    company.industry?.industryGics?.subIndustryCode || "";
  const selectedGics = gicsOptions.find(
    (opt) => String(opt.code) === String(subIndustryCode),
  );

  return (
    <>
      <div className="mb-5 flex items-center">
        <span className="min-w-[140px] mr-4 font-medium">
          {t("companyEditPage.fields.gicsSubIndustry")}
        </span>
        <div className="w-[320px] max-w-full flex items-center">
          {gicsLoading ? (
            <div className="text-grey py-2">
              {t("companyEditPage.loadingIndustry")}
            </div>
          ) : gicsError ? (
            <div className="text-red-500 py-2">{gicsError}</div>
          ) : (
            <>
              <Select
                value={subIndustryCode}
                onValueChange={(val) => setSubIndustryCode(String(val))}
              >
                <SelectTrigger
                  className={
                    "w-full bg-black-1 border-gray-300 text-white" +
                    (subIndustryCode !== originalSubIndustryCode
                      ? " border-orange-3"
                      : "")
                  }
                >
                  <SelectValue
                    placeholder={
                      company.industry?.industryGics
                        ? `${company.industry.industryGics.en?.subIndustryName || company.industry.industryGics.subIndustryCode} (${company.industry.industryGics.subIndustryCode})`
                        : t("companyEditPage.placeholders.selectIndustry")
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {gicsOptions.map((opt) => (
                    <SelectItem key={String(opt.code)} value={String(opt.code)}>
                      {opt.label ||
                        opt.en?.subIndustryName ||
                        opt.subIndustryName}{" "}
                      ({opt.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                type="button"
                onClick={() => setSubIndustryCode(originalSubIndustryCode)}
                disabled={subIndustryCode === originalSubIndustryCode}
                className={
                  "ml-2 bg-none border-none p-0 " +
                  (subIndustryCode === originalSubIndustryCode
                    ? "cursor-not-allowed"
                    : "cursor-pointer")
                }
                aria-label={t("companyEditPage.aria.undoIndustry")}
              >
                <Undo2
                  className={
                    subIndustryCode === originalSubIndustryCode
                      ? "text-grey"
                      : "text-white hover:text-orange-3"
                  }
                />
              </button>
              <IconCheckbox
                checked={industryVerified}
                disabled={industryIsDisabled || industryLoading}
                badgeIconClass={industryBadgeIconClass}
                className="ml-2"
                onCheckedChange={(checked) =>
                  setIndustryVerified(checked === true)
                }
              />
            </>
          )}
        </div>
      </div>
      {selectedGics && (
        <div className="text-sm text-grey mt-2 mb-8 ml-[156px] max-w-[600px] leading-[1.5]">
          <b>{selectedGics.sector}</b> &gt; <b>{selectedGics.group}</b> &gt;{" "}
          <b>{selectedGics.industry}</b>
          <br />
          <span className="italic">{selectedGics.description}</span>
        </div>
      )}
    </>
  );
}

interface BaseYearFieldProps {
  baseYear: string;
  setBaseYear: (value: string) => void;
  baseYearVerified: boolean;
  setBaseYearVerified: (value: boolean) => void;
  originalBaseYear: string;
  baseYearIsDisabled: boolean;
  baseYearBadgeIconClass: string;
  industryLoading: boolean;
}

export function BaseYearField({
  baseYear,
  setBaseYear,
  baseYearVerified,
  setBaseYearVerified,
  originalBaseYear,
  baseYearIsDisabled,
  baseYearBadgeIconClass,
  industryLoading,
}: BaseYearFieldProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-6 flex items-center">
      <span className="min-w-[140px] mr-4 font-medium">
        {t("companyEditPage.fields.baseYear")}
      </span>
      <Input
        type="number"
        value={baseYear}
        onChange={(e) => setBaseYear(e.target.value)}
        className={
          "w-[150px] align-right bg-black-1 border" +
          (baseYear !== originalBaseYear ? " border-orange-600" : "")
        }
      />
      <button
        type="button"
        onClick={() => setBaseYear(originalBaseYear)}
        disabled={baseYear === originalBaseYear}
        className={
          "ml-2 bg-none border-none p-0 " +
          (baseYear === originalBaseYear
            ? "cursor-not-allowed"
            : "cursor-pointer")
        }
        aria-label={t("companyEditPage.aria.undoBaseYear")}
      >
        <Undo2
          className={
            baseYear === originalBaseYear
              ? "text-grey"
              : "text-white hover:text-orange-3"
          }
        />
      </button>
      <IconCheckbox
        checked={baseYearVerified}
        disabled={baseYearIsDisabled || industryLoading}
        badgeIconClass={baseYearBadgeIconClass}
        className="ml-2"
        onCheckedChange={(checked) => setBaseYearVerified(checked === true)}
      />
    </div>
  );
}

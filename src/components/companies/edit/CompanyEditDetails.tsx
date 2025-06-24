import { useState, useEffect } from "react";
import { validateValue } from "../../../utils/editorValidation";
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
import { Undo2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useGicsCodes } from "@/hooks/companies/useGicsCodes";
import { useCompanyEditDetailsSave } from "@/hooks/companies/useCompanyEditDetailsSave";
import { useToast } from "@/contexts/ToastContext";

export function CompanyEditDetails({
  company,
  onSave,
}: {
  company: CompanyDetailsType;
  onSave?: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [subIndustryCode, setSubIndustryCode] = useState(
    company.industry?.industryGics?.subIndustryCode
      ? String(company.industry.industryGics.subIndustryCode)
      : "",
  );
  const [industryVerified, setIndustryVerified] = useState(
    !!company.industry?.metadata?.verifiedBy,
  );
  const [baseYear, setBaseYear] = useState(company.baseYear?.year || "");
  const [baseYearVerified, setBaseYearVerified] = useState(
    !!company.baseYear?.metadata?.verifiedBy,
  );

  const [comment, setComment] = useState<string>("");
  const [source, setSource] = useState<string>("");

  const {
    data: gicsOptions = [],
    isLoading: gicsLoading,
    isError: gicsIsError,
    error: gicsErrorObj,
  } = useGicsCodes();

  const gicsError = gicsIsError
    ? gicsErrorObj instanceof Error
      ? gicsErrorObj.message
      : "Failed to load industry options"
    : null;
  const [error, setError] = useState<string | null>(null);

  const {
    saveCompanyEditDetails,
    isPending: loading,
    error: mutationError,
  } = useCompanyEditDetailsSave();

  useEffect(() => {
    setIndustryVerified(
      subIndustryCode ===
        (company.industry?.industryGics?.subIndustryCode || "")
        ? !!company.industry?.metadata?.verifiedBy
        : false,
    );
  }, [
    subIndustryCode,
    company.industry?.industryGics?.subIndustryCode,
    company.industry?.metadata?.verifiedBy,
  ]);

  useEffect(() => {
    setBaseYearVerified(
      String(baseYear) === String(company.baseYear?.year || "")
        ? !!company.baseYear?.metadata?.verifiedBy
        : false,
    );
  }, [
    baseYear,
    company.baseYear?.year,
    company.baseYear?.metadata?.verifiedBy,
  ]);

  const [industryIsDisabled, industryBadgeIconClass] = validateValue({
    value: subIndustryCode,
    originalValue: company.industry?.industryGics?.subIndustryCode || "",
    originalVerified: !!company.industry?.metadata?.verifiedBy,
    verified: industryVerified,
  });
  const [baseYearIsDisabled, baseYearBadgeIconClass] = validateValue({
    value: String(baseYear),
    originalValue: String(company.baseYear?.year || ""),
    originalVerified: !!company.baseYear?.metadata?.verifiedBy,
    verified: baseYearVerified,
  });

  const handleSave = () => {
    setError(null);
    saveCompanyEditDetails(
      {
        company,
        subIndustryCode,
        baseYear,
        comment,
        source,
        industryVerified,
        baseYearVerified,
        onSave,
      },
      {
        onError: (e) => {
          setError(e.message || "Failed to update");
          showToast(
            t("companyEditPage.error.couldNotSave"),
            t("companyEditPage.error.tryAgainLater"),
          );
        },
        onSuccess: () => {
          setComment("");
          setSource("");
          showToast(
            t("companyEditPage.successDetails.title"),
            t("companyEditPage.successDetails.description"),
          );
        },
      },
    );
  };

  const selectedGics: GicsOption | undefined = (
    gicsOptions as GicsOption[]
  ).find((opt) => String(opt.code) === String(subIndustryCode));

  return (
    <div className="my-4">
      <h3 className="mb-6 text-lg font-semibold">Edit Industry & Base Year</h3>
      <div className="mb-5 flex items-center">
        <span className="min-w-[140px] mr-4 font-medium">
          GICS Sub-Industry
        </span>
        <div className="w-[320px] max-w-full flex items-center">
          {gicsLoading ? (
            <div className="text-grey py-2">Loading…</div>
          ) : gicsError ? (
            <div className="text-red-500 py-2">{gicsError}</div>
          ) : (
            <Select
              value={subIndustryCode}
              onValueChange={(val) => setSubIndustryCode(String(val))}
            >
              <SelectTrigger
                className={
                  "w-full bg-black-1 border-gray-300 text-white" +
                  (subIndustryCode !==
                  (company.industry?.industryGics?.subIndustryCode || "")
                    ? " border-orange-3"
                    : "")
                }
              >
                <SelectValue
                  placeholder={
                    company.industry?.industryGics
                      ? `${company.industry.industryGics.en?.subIndustryName || company.industry.industryGics.subIndustryCode} (${company.industry.industryGics.subIndustryCode})`
                      : "Select industry…"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {(gicsOptions as GicsOption[]).map((opt) => (
                  <SelectItem key={String(opt.code)} value={String(opt.code)}>
                    {opt.label ||
                      opt.en?.subIndustryName ||
                      opt.subIndustryName}{" "}
                    ({opt.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <button
            type="button"
            onClick={() =>
              setSubIndustryCode(
                String(company.industry?.industryGics?.subIndustryCode || ""),
              )
            }
            disabled={
              subIndustryCode ===
              (company.industry?.industryGics?.subIndustryCode || "")
            }
            className={
              "ml-2 bg-none border-none p-0 " +
              (subIndustryCode ===
              (company.industry?.industryGics?.subIndustryCode || "")
                ? "cursor-not-allowed"
                : "cursor-pointer")
            }
            aria-label="Undo industry change"
          >
            <Undo2
              className={
                subIndustryCode ===
                (company.industry?.industryGics?.subIndustryCode || "")
                  ? "text-grey"
                  : "text-white hover:text-orange-3"
              }
            />
          </button>
          <IconCheckbox
            checked={industryVerified}
            disabled={industryIsDisabled || loading}
            badgeIconClass={industryBadgeIconClass}
            className="ml-2"
            onCheckedChange={(checked) => {
              setIndustryVerified(checked === true);
            }}
          />
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
      <div className="mb-6 flex items-center">
        <span className="min-w-[140px] mr-4 font-medium">Base Year</span>
        <Input
          type="number"
          value={baseYear}
          onChange={(e) => setBaseYear(e.target.value)}
          className={
            "w-[150px] align-right bg-black-1 border" +
            (String(baseYear) !== String(company.baseYear?.year || "")
              ? " border-orange-600"
              : "")
          }
        />
        <button
          type="button"
          onClick={() => setBaseYear(String(company.baseYear?.year || ""))}
          disabled={String(baseYear) === String(company.baseYear?.year || "")}
          className={
            "ml-2 bg-none border-none p-0 " +
            (String(baseYear) === String(company.baseYear?.year || "")
              ? "cursor-not-allowed"
              : "cursor-pointer")
          }
          aria-label="Undo base year change"
        >
          <Undo2
            className={
              String(baseYear) === String(company.baseYear?.year || "")
                ? "text-grey"
                : "text-white hover:text-orange-3"
            }
          />
        </button>
        <IconCheckbox
          checked={baseYearVerified}
          disabled={baseYearIsDisabled || loading}
          badgeIconClass={baseYearBadgeIconClass}
          className="ml-2"
          onCheckedChange={(checked) => {
            setBaseYearVerified(checked === true);
          }}
        />
      </div>
      <div className="w-full ps-4 pe-2 mt-10">
        <textarea
          className="ms-2 w-full p-2 border-gray-300 rounded text-white bg-black-1"
          rows={4}
          placeholder="Comment"
          name="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        ></textarea>
        <input
          type="text"
          className="ms-2 mt-2 w-full p-2 rounded text-white bg-black-1"
          name="source"
          placeholder="Source URL"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
      </div>
      {(error || mutationError) && (
        <div className="text-red-500">{error || mutationError?.message}</div>
      )}
      <button
        onClick={handleSave}
        disabled={loading}
        className="inline-flex float-right mt-3 items-center justify-center text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white disabled:pointer-events-none hover:opacity-80 active:ring-1 active:ring-white disabled:opacity-50 h-10 bg-blue-5 text-white rounded-lg hover:bg-blue-6 transition px-4 py-1 font-medium"
      >
        {loading
          ? t("companyEditPage.save") + "..."
          : t("companyEditPage.save")}
      </button>
    </div>
  );
}

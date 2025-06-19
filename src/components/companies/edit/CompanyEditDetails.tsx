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

export function CompanyEditDetails({
  company,
  onSave,
}: {
  company: CompanyDetailsType;
  onSave?: () => void;
}) {
  const { t } = useTranslation();
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
        onSave,
      },
      {
        onError: (e) => setError(e.message || "Failed to update"),
      },
    );
  };

  const selectedGics: GicsOption | undefined = (
    gicsOptions as GicsOption[]
  ).find((opt) => String(opt.code) === String(subIndustryCode));

  return (
    <div style={{ margin: "1em 0" }}>
      <h3 style={{ marginBottom: 24 }}>Edit Industry & Base Year</h3>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center" }}>
        <span style={{ minWidth: 140, marginRight: 16, fontWeight: 500 }}>
          GICS Sub-Industry
        </span>
        <div
          style={{
            width: 320,
            maxWidth: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          {gicsLoading ? (
            <div style={{ color: "#aaa", padding: "8px 0" }}>Loading…</div>
          ) : gicsError ? (
            <div style={{ color: "red", padding: "8px 0" }}>{gicsError}</div>
          ) : (
            <Select
              value={subIndustryCode}
              onValueChange={(val) => setSubIndustryCode(String(val))}
            >
              <SelectTrigger
                className={
                  "w-full bg-black-1 text-white border border-gray-300" +
                  (subIndustryCode !==
                  (company.industry?.industryGics?.subIndustryCode || "")
                    ? " border-orange-600"
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
            style={{
              marginLeft: 8,
              background: "none",
              border: "none",
              cursor:
                subIndustryCode ===
                (company.industry?.industryGics?.subIndustryCode || "")
                  ? "not-allowed"
                  : "pointer",
              padding: 0,
            }}
            aria-label="Undo industry change"
          >
            <Undo2
              className={
                subIndustryCode ===
                (company.industry?.industryGics?.subIndustryCode || "")
                  ? "text-grey"
                  : "text-white hover:text-orange-600"
              }
            />
          </button>
          <IconCheckbox
            checked={industryVerified}
            disabled={industryIsDisabled}
            badgeIconClass={industryBadgeIconClass}
            style={{ marginLeft: 8 }}
            onCheckedChange={(checked) => setIndustryVerified(checked === true)}
          />
        </div>
        {selectedGics && (
          <div
            style={{
              fontSize: 12,
              color: "#555",
              marginTop: 4,
              marginBottom: 32,
            }}
          >
            <b>{selectedGics.sector}</b> &gt; <b>{selectedGics.group}</b> &gt;{" "}
            <b>{selectedGics.industry}</b>
            <br />
            <i>{selectedGics.description}</i>
          </div>
        )}
      </div>
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center" }}>
        <span style={{ minWidth: 140, marginRight: 16, fontWeight: 500 }}>
          Base Year
        </span>
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
          style={{ marginLeft: 0, marginTop: 2 }}
        />
        <button
          type="button"
          onClick={() => setBaseYear(String(company.baseYear?.year || ""))}
          disabled={String(baseYear) === String(company.baseYear?.year || "")}
          style={{
            marginLeft: 8,
            background: "none",
            border: "none",
            cursor:
              String(baseYear) === String(company.baseYear?.year || "")
                ? "not-allowed"
                : "pointer",
            padding: 0,
          }}
          aria-label="Undo base year change"
        >
          <Undo2
            className={
              String(baseYear) === String(company.baseYear?.year || "")
                ? "text-grey"
                : "text-white hover:text-orange-600"
            }
          />
        </button>
        <IconCheckbox
          checked={baseYearVerified}
          disabled={baseYearIsDisabled}
          badgeIconClass={baseYearBadgeIconClass}
          style={{ marginLeft: 8 }}
          onCheckedChange={(checked) => setBaseYearVerified(checked === true)}
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
        <div style={{ color: "red" }}>{error || mutationError?.message}</div>
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

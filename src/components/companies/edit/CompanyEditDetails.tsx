import { useState, useEffect } from "react";
import { Undo2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { isVerified } from "@/utils/business/verification";
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
import { useGicsCodes } from "@/hooks/companies/useGicsCodes";
import { useCompanyEditDetailsSave } from "@/hooks/companies/useCompanyEditDetailsSave";
import { useCompanyDetailsSave } from "@/hooks/companies/useCompanyDetailsSave";
import { useToast } from "@/contexts/ToastContext";
import { validateValue } from "../../../utils/ui/validation";
import { CompanyEditFieldWithUndo } from "./CompanyEditFieldWithUndo";
import { CommentSourceBlock } from "./CommentSourceBlock";

function getDescriptionByLang(
  company: CompanyDetailsType,
  lang: "EN" | "SV",
): string {
  const desc = company.descriptions?.find((d) => d.language === lang);
  return desc?.text ?? "";
}

export function CompanyEditDetails({
  company,
  onSave,
}: {
  company: CompanyDetailsType;
  onSave?: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [name, setName] = useState(company.name ?? "");
  const [descriptionEn, setDescriptionEn] = useState(() =>
    getDescriptionByLang(company, "EN"),
  );
  const [descriptionSv, setDescriptionSv] = useState(() =>
    getDescriptionByLang(company, "SV"),
  );
  const [lei, setLei] = useState(company.lei ?? "");
  const [tagsInput, setTagsInput] = useState("");
  const [detailsComment, setDetailsComment] = useState("");
  const [detailsSource, setDetailsSource] = useState("");

  const [subIndustryCode, setSubIndustryCode] = useState(
    company.industry?.industryGics?.subIndustryCode
      ? String(company.industry.industryGics.subIndustryCode)
      : "",
  );
  const [industryVerified, setIndustryVerified] = useState(
    isVerified(company.industry?.metadata),
  );
  const [baseYear, setBaseYear] = useState(
    String(company.baseYear?.year ?? ""),
  );
  const [baseYearVerified, setBaseYearVerified] = useState(
    isVerified(company.baseYear?.metadata),
  );
  const [industryComment, setIndustryComment] = useState("");
  const [industrySource, setIndustrySource] = useState("");

  const [error, setError] = useState<string | null>(null);

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

  const {
    saveCompanyDetails,
    isPending: detailsLoading,
    error: detailsMutationError,
  } = useCompanyDetailsSave();
  const {
    saveCompanyEditDetails,
    isPending: industryLoading,
    error: industryMutationError,
  } = useCompanyEditDetailsSave();

  useEffect(() => {
    setIndustryVerified(
      subIndustryCode ===
        (company.industry?.industryGics?.subIndustryCode || "")
        ? isVerified(company.industry?.metadata)
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
        ? isVerified(company.baseYear?.metadata)
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
    originalVerified: isVerified(company.industry?.metadata),
    verified: industryVerified,
  });
  const [baseYearIsDisabled, baseYearBadgeIconClass] = validateValue({
    value: String(baseYear),
    originalValue: String(company.baseYear?.year || ""),
    originalVerified: isVerified(company.baseYear?.metadata),
    verified: baseYearVerified,
  });

  const showErrorToast = () => {
    showToast(
      t("companyEditPage.error.couldNotSave"),
      t("companyEditPage.error.tryAgainLater"),
    );
  };

  const handleSaveCompanyDetails = () => {
    setError(null);
    saveCompanyDetails(
      {
        company,
        name,
        descriptionEn,
        descriptionSv,
        lei,
        tagsInput,
        comment: detailsComment,
        source: detailsSource,
        onSave,
      },
      {
        onError: (e) => {
          setError(e.message || "Failed to update company details");
          showErrorToast();
        },
        onSuccess: () => {
          setDetailsComment("");
          setDetailsSource("");
          showToast(
            t("companyEditPage.successDetails.title"),
            t("companyEditPage.successCompanyDetails.description"),
          );
        },
      },
    );
  };

  const handleSaveIndustryAndBaseYear = () => {
    setError(null);
    saveCompanyEditDetails(
      {
        company,
        subIndustryCode,
        baseYear,
        comment: industryComment,
        source: industrySource,
        industryVerified,
        baseYearVerified,
        onSave,
      },
      {
        onError: (e) => {
          setError(e.message || "Failed to update");
          showErrorToast();
        },
        onSuccess: () => {
          setIndustryComment("");
          setIndustrySource("");
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

  const originalSubIndustryCode =
    company.industry?.industryGics?.subIndustryCode || "";
  const originalBaseYear = String(company.baseYear?.year || "");

  return (
    <div className="my-4">
      {/* Section 1: Company details */}
      <div className="overflow-x-auto overflow-y-visible">
        <div className="min-w-max">
          <div className="mb-8">
            <h3 className="mb-6 text-lg font-semibold">
              {t("companyEditPage.tabs.companyDetails")}
            </h3>
            <CompanyEditFieldWithUndo
              label="Name"
              value={name}
              originalValue={company.name ?? ""}
              onChange={setName}
              onUndo={() => setName(company.name ?? "")}
              type="input"
              aria-label="Undo name change"
            />
            <CompanyEditFieldWithUndo
              label="Description (EN)"
              value={descriptionEn}
              originalValue={getDescriptionByLang(company, "EN")}
              onChange={setDescriptionEn}
              onUndo={() =>
                setDescriptionEn(getDescriptionByLang(company, "EN"))
              }
              type="textarea"
              textareaRows={3}
              aria-label="Undo description (EN) change"
            />
            <CompanyEditFieldWithUndo
              label="Description (SV)"
              value={descriptionSv}
              originalValue={getDescriptionByLang(company, "SV")}
              onChange={setDescriptionSv}
              onUndo={() =>
                setDescriptionSv(getDescriptionByLang(company, "SV"))
              }
              type="textarea"
              textareaRows={3}
              aria-label="Undo description (SV) change"
            />
            <CompanyEditFieldWithUndo
              label="LEI"
              value={lei}
              originalValue={company.lei ?? ""}
              onChange={setLei}
              onUndo={() => setLei(company.lei ?? "")}
              type="input"
              placeholder="Legal Entity Identifier"
              aria-label="Undo LEI change"
            />
            <CompanyEditFieldWithUndo
              label="Tags"
              value={tagsInput}
              originalValue=""
              onChange={setTagsInput}
              onUndo={() => setTagsInput("")}
              type="input"
              placeholder="Comma-separated tags"
              aria-label="Undo tags change"
            />
          </div>

          <CommentSourceBlock
            comment={detailsComment}
            source={detailsSource}
            onCommentChange={setDetailsComment}
            onSourceChange={setDetailsSource}
          />
          <button
            type="button"
            onClick={handleSaveCompanyDetails}
            disabled={detailsLoading}
            className="inline-flex float-right mt-3 items-center justify-center text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white disabled:pointer-events-none hover:opacity-80 active:ring-1 active:ring-white disabled:opacity-50 h-10 bg-blue-5 text-white rounded-lg hover:bg-blue-6 transition px-4 py-1 font-medium"
          >
            {detailsLoading
              ? t("companyEditPage.save") + "..."
              : t("companyEditPage.saveCompanyDetails")}
          </button>
        </div>
      </div>

      {/* Section 2: Industry & base year */}
      <div className="overflow-x-auto overflow-y-visible mt-12">
        <div className="min-w-max">
          <div className="mb-8">
            <h3 className="mb-6 text-lg font-semibold">
              {t("companyEditPage.sections.industryAndBaseYear")}
            </h3>
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
                              : "Select industry…"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {(gicsOptions as GicsOption[]).map((opt) => (
                          <SelectItem
                            key={String(opt.code)}
                            value={String(opt.code)}
                          >
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
                      onClick={() =>
                        setSubIndustryCode(originalSubIndustryCode)
                      }
                      disabled={subIndustryCode === originalSubIndustryCode}
                      className={
                        "ml-2 bg-none border-none p-0 " +
                        (subIndustryCode === originalSubIndustryCode
                          ? "cursor-not-allowed"
                          : "cursor-pointer")
                      }
                      aria-label="Undo industry change"
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
                <b>{selectedGics.sector}</b> &gt; <b>{selectedGics.group}</b>{" "}
                &gt; <b>{selectedGics.industry}</b>
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
                aria-label="Undo base year change"
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
                onCheckedChange={(checked) =>
                  setBaseYearVerified(checked === true)
                }
              />
            </div>
          </div>

          <CommentSourceBlock
            comment={industryComment}
            source={industrySource}
            onCommentChange={setIndustryComment}
            onSourceChange={setIndustrySource}
            wrapperClassName="mt-10"
          />
          <button
            type="button"
            onClick={handleSaveIndustryAndBaseYear}
            disabled={industryLoading}
            className="inline-flex float-right mt-3 items-center justify-center text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white disabled:pointer-events-none hover:opacity-80 active:ring-1 active:ring-white disabled:opacity-50 h-10 bg-blue-5 text-white rounded-lg hover:bg-blue-6 transition px-4 py-1 font-medium"
          >
            {industryLoading
              ? t("companyEditPage.save") + "..."
              : t("companyEditPage.saveIndustryAndBaseYear")}
          </button>
        </div>
      </div>

      {(error || detailsMutationError || industryMutationError) && (
        <div className="text-red-500 mt-4">
          {error ||
            detailsMutationError?.message ||
            industryMutationError?.message}
        </div>
      )}
    </div>
  );
}

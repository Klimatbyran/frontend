import { useState, useEffect } from "react";
import {
  updateCompanyIndustry,
  updateCompanyBaseYear,
  getIndustryGics,
} from "@/lib/api";
import type { CompanyDetails as CompanyDetailsType } from "@/types/company";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [source, setSource] = useState("");
  const [gicsOptions, setGicsOptions] = useState<any[]>([]);
  const [gicsLoading, setGicsLoading] = useState(true);
  const [gicsError, setGicsError] = useState<string | null>(null);

  // Reset verified to false if value changes
  useEffect(() => {
    setIndustryVerified(
      subIndustryCode ===
        (company.industry?.industryGics?.subIndustryCode || "")
        ? !!company.industry?.metadata?.verifiedBy
        : false,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subIndustryCode]);

  useEffect(() => {
    setBaseYearVerified(
      String(baseYear) === String(company.baseYear?.year || "")
        ? !!company.baseYear?.metadata?.verifiedBy
        : false,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseYear]);

  useEffect(() => {
    let mounted = true;
    setGicsLoading(true);
    getIndustryGics()
      .then((data) => {
        let options: any[] = [];
        if (Array.isArray(data)) {
          options = data;
        } else if (data && typeof data === "object") {
          options = Object.values(data);
        }
        if (mounted) {
          setGicsOptions(options);
          setGicsLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setGicsError("Failed to load industry options");
          setGicsLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  // --- Industry validation logic ---
  const industryOriginalVerified = !!company.industry?.metadata?.verifiedBy;
  const industryValueChanged =
    subIndustryCode !== (company.industry?.industryGics?.subIndustryCode || "");
  let industryBadgeIconClass = "";
  if (industryOriginalVerified && !industryValueChanged) {
    industryBadgeIconClass = "text-green-4";
  } else if (industryVerified && industryValueChanged) {
    industryBadgeIconClass = "text-green-3";
  }
  const industryIsDisabled = industryOriginalVerified && !industryValueChanged;

  // --- Base year validation logic ---
  const baseYearOriginalVerified = !!company.baseYear?.metadata?.verifiedBy;
  const baseYearValueChanged =
    String(baseYear) !== String(company.baseYear?.year || "");
  let baseYearBadgeIconClass = "";
  if (baseYearOriginalVerified && !baseYearValueChanged) {
    baseYearBadgeIconClass = "text-green-4";
  } else if (baseYearVerified && baseYearValueChanged) {
    baseYearBadgeIconClass = "text-green-3";
  }
  const baseYearIsDisabled = baseYearOriginalVerified && !baseYearValueChanged;

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const metadata: Record<string, string> = {};
      if (comment) metadata.comment = comment;
      if (source) metadata.source = source;
      if (subIndustryCode) {
        await updateCompanyIndustry(
          company.wikidataId,
          subIndustryCode,
          Object.keys(metadata).length ? metadata : undefined,
        );
      }
      if (baseYear) {
        await updateCompanyBaseYear(
          company.wikidataId,
          Number(baseYear),
          Object.keys(metadata).length ? metadata : undefined,
        );
      }
      if (onSave) onSave();
    } catch (e: any) {
      setError(e.message || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const selectedGics = gicsOptions.find(
    (opt) => String(opt.code) === String(subIndustryCode),
  );

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
      {error && <div style={{ color: "red" }}>{error}</div>}
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

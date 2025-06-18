import { useState, useEffect } from "react";
import { updateCompanyIndustry, updateCompanyBaseYear } from "@/lib/api";
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

// Placeholder GICS options (replace with API call when endpoint is ready)
const GICS_OPTIONS = [
  {
    code: "10101010",
    label: "Oil & Gas Drilling",
    sector: "Energy",
    group: "Energy",
    industry: "Energy Equipment & Services",
    description:
      "Drilling contractors or owners of drilling rigs that contract their services to oil companies, and manufacturers of drilling equipment.",
  },
  {
    code: "10101020",
    label: "Oil & Gas Equipment & Services",
    sector: "Energy",
    group: "Energy",
    industry: "Energy Equipment & Services",
    description:
      "Manufacturers of equipment, including drilling rigs and equipment, and providers of supplies and services to oil fields and offshore platforms.",
  },
  {
    code: "10102010",
    label: "Integrated Oil & Gas",
    sector: "Energy",
    group: "Energy",
    industry: "Oil, Gas & Consumable Fuels",
    description:
      "Integrated oil companies engaged in the exploration & production of oil and gas, as well as refining, marketing, and transportation.",
  },
  // ...add more as needed
];

export function CompanyDetails({
  company,
  onSave,
}: {
  company: CompanyDetailsType;
  onSave?: () => void;
}) {
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

  const selectedGics = GICS_OPTIONS.find((opt) => opt.code === subIndustryCode);

  // Try to match Input styles for select
  const inputClassName =
    "block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed";

  return (
    <div style={{ margin: "1em 0" }}>
      <h3>Edit Industry & Base Year</h3>
      <div style={{ marginBottom: 8, display: "flex", alignItems: "center" }}>
        <label style={{ flex: 1 }}>
          GICS Sub-Industry:
          <div style={{ marginTop: 2, width: 320, maxWidth: "100%" }}>
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
                {GICS_OPTIONS.map((opt) => (
                  <SelectItem key={String(opt.code)} value={String(opt.code)}>
                    {opt.label} ({opt.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </label>
        <IconCheckbox
          checked={industryVerified}
          disabled={industryIsDisabled}
          badgeIconClass={industryBadgeIconClass}
          style={{ marginLeft: 8 }}
          onCheckedChange={(checked) => setIndustryVerified(checked === true)}
        />
      </div>
      {selectedGics && (
        <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>
          <b>{selectedGics.sector}</b> &gt; <b>{selectedGics.group}</b> &gt;{" "}
          <b>{selectedGics.industry}</b>
          <br />
          <i>{selectedGics.description}</i>
        </div>
      )}
      <div style={{ marginBottom: 8, display: "flex", alignItems: "center" }}>
        <label style={{ flex: 1 }}>
          Base Year:
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
        </label>
        <IconCheckbox
          checked={baseYearVerified}
          disabled={baseYearIsDisabled}
          badgeIconClass={baseYearBadgeIconClass}
          style={{ marginLeft: 8 }}
          onCheckedChange={(checked) => setBaseYearVerified(checked === true)}
        />
      </div>
      {/* Comment and Source fields styled to match CompanyEditPage */}
      <div className="w-full ps-4 pe-2 mt-6">
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
        {loading ? "Saving..." : "Save"}
      </button>
    </div>
  );
}

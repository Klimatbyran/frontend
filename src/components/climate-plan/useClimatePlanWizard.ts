import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMunicipalities } from "@/lib/api";
import { useSectorEmissions } from "@/hooks/territories/useSectorEmissions";
import { downloadClimatePlanDocx } from "./climatePlanDocument";
import {
  buildClimatePlanFigures,
  type ClimatePlanFigures,
} from "./climatePlanFigures";
import { initialAnswers } from "./climatePlanMockupContent";

export function useClimatePlanWizard() {
  const { data: municipalities = [], isLoading: municipalitiesLoading } =
    useQuery({
      queryKey: ["climate-plan-municipalities"],
      queryFn: getMunicipalities,
      staleTime: 30 * 60 * 1000,
    });

  const [query, setQuery] = useState("");
  const [listOpen, setListOpen] = useState(false);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [answers, setAnswers] = useState(initialAnswers);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const selected =
    municipalities.find((municipality) => municipality.name === selectedName) ??
    null;

  const { sectorEmissions, loading: sectorsLoading } = useSectorEmissions(
    "municipalities",
    selectedName ?? undefined,
  );

  const figures = useMemo<ClimatePlanFigures | null>(() => {
    if (!selected) return null;
    return buildClimatePlanFigures(selected, sectorEmissions?.sectors);
  }, [selected, sectorEmissions]);

  useEffect(() => {
    if (!figures) return;
    setAnswers((current) => ({ ...current, ...figures.answers }));
  }, [figures]);

  const matches = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("sv");
    const names = municipalities
      .map((municipality) => municipality.name)
      .sort((a, b) => a.localeCompare(b, "sv"));
    if (!needle) return names;
    return names.filter((name) =>
      name.toLocaleLowerCase("sv").includes(needle),
    );
  }, [municipalities, query]);

  function changeQuery(value: string) {
    setQuery(value);
    setListOpen(true);
    if (selectedName && value !== selectedName) setSelectedName(null);
  }

  function selectMunicipality(name: string) {
    setSelectedName(name);
    setQuery(name);
    setListOpen(false);
    setDownloadError(null);
  }

  async function download() {
    if (!selectedName || !figures) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      await downloadClimatePlanDocx({
        municipalityName: selectedName,
        figures,
        answers,
        checks,
      });
    } catch {
      setDownloadError("Filen kunde inte skapas. Försök igen.");
    } finally {
      setDownloading(false);
    }
  }

  return {
    query,
    changeQuery,
    listOpen,
    setListOpen,
    matches,
    selectMunicipality,
    selectedName,
    municipalitiesLoading,
    municipalitiesMissing:
      !municipalitiesLoading && municipalities.length === 0,
    figures,
    sectorsLoading,
    answers,
    setAnswer: (id: string, value: string) =>
      setAnswers((current) => ({ ...current, [id]: value })),
    checks,
    setCheck: (id: string, checked: boolean) =>
      setChecks((current) => ({ ...current, [id]: checked })),
    download,
    downloading,
    downloadError,
  };
}

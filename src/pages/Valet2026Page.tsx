import { PageLoading } from "@/components/pageStates/Loading";
import { PageError } from "@/components/pageStates/Error";
import { PageNoData } from "@/components/pageStates/NoData";
import { NationStoryPage } from "@/components/nation/story/NationStoryPage";
import { useNationStoryData } from "@/hooks/nation/useNationStoryData";

export function Valet2026Page() {
  const { nation, metrics, sortedRegions, loading, error } =
    useNationStoryData();

  if (loading) return <PageLoading />;
  if (error) return <PageError />;
  if (!nation || !metrics) return <PageNoData />;

  return (
    <NationStoryPage
      nation={nation}
      metrics={metrics}
      sortedRegions={sortedRegions}
    />
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

interface TrendAnalysisSummaryCardsProps {
  totalCompanies: number;
  avgDataPoints: number;
  avgMissingYears: number;
  outlierPercentage: number;
}

export function TrendAnalysisSummaryCards({
  totalCompanies,
  avgDataPoints,
  avgMissingYears,
  outlierPercentage,
}: TrendAnalysisSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
        </CardHeader>
        <CardContent>
          <Text variant="h2">{totalCompanies}</Text>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Avg Data Points</CardTitle>
        </CardHeader>
        <CardContent>
          <Text variant="h2">{avgDataPoints.toFixed(1)}</Text>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Avg Missing Years
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Text variant="h2">{avgMissingYears.toFixed(1)}</Text>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            With Unusual Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Text variant="h2">{outlierPercentage.toFixed(1)}%</Text>
        </CardContent>
      </Card>
    </div>
  );
}

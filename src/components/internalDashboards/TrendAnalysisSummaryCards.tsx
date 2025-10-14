import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import {
  TrendingDown,
  TrendingUp,
  Minus,
  Building2,
  BarChart3,
  Target,
  CheckCircle,
} from "lucide-react";

interface TrendAnalysisSummaryCardsProps {
  totalCompanies: number;
  avgDataPoints: number;
  avgCleanDataPoints: number;
  decreasingTrendCount: number;
  increasingTrendCount: number;
  noTrendCount: number;
  meetsCarbonLawCount: number;
  meetsParisCount: number;
}

export function TrendAnalysisSummaryCards({
  totalCompanies,
  avgDataPoints,
  avgCleanDataPoints,
  decreasingTrendCount,
  increasingTrendCount,
  noTrendCount,
  meetsCarbonLawCount,
  meetsParisCount,
}: TrendAnalysisSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Total Companies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Text variant="h2">{totalCompanies}</Text>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Avg Data Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Text variant="h2">{avgDataPoints.toFixed(1)}</Text>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="w-4 h-4" />
            Avg Data Since Base Year
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Text variant="h2">{avgCleanDataPoints.toFixed(1)}</Text>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Trend Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-green-500" />
                <Text variant="small" className="text-gray-300">
                  Decreasing
                </Text>
              </div>
              <Text variant="h3" className="text-green-400">
                {decreasingTrendCount}
              </Text>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-red-500" />
                <Text variant="small" className="text-gray-300">
                  Increasing
                </Text>
              </div>
              <Text variant="h3" className="text-red-400">
                {increasingTrendCount}
              </Text>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Minus className="w-4 h-4 text-gray-500" />
                <Text variant="small" className="text-gray-300">
                  No Trend
                </Text>
              </div>
              <Text variant="h3" className="text-gray-400">
                {noTrendCount}
              </Text>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Meets Carbon Law
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Text variant="h2">{meetsCarbonLawCount}</Text>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-500" />
            Meets Paris
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Text variant="h2">{meetsParisCount}</Text>
        </CardContent>
      </Card>
    </div>
  );
}

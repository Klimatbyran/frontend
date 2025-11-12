import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { IndustryGroup } from "@/types/visualizations";
import type { ColorFunction } from "@/types/visualizations";

interface SunburstChartProps<T> {
  industries: IndustryGroup<T>[];
  onCompanyClick?: (company: T) => void;
  colorForValue: ColorFunction;
  getValue: (item: T) => number;
  getCompanyName: (item: T) => string;
  calculateAverage: (items: T[]) => number;
  tooltipFormatter: (params: any) => string;
  excludedCount?: number;
  excludedLabel?: string;
  description?: {
    title: string;
    subtitle: string;
  };
}

export function SunburstChart<T>({
  industries,
  onCompanyClick,
  colorForValue,
  getValue,
  getCompanyName,
  calculateAverage,
  tooltipFormatter,
  excludedCount,
  excludedLabel,
  description,
}: SunburstChartProps<T>) {
  const sunburstData = useMemo(() => {
    const data: any = {
      name: "",
      label: {
        show: false,
      },
      emphasis: {
        disabled: true,
      },
      silent: true,
      children: industries.map((industry) => {
        const children = industry.comps.map((item) => {
          const value = getValue(item);
          const sizeValue = Math.max(Math.abs(value), 0.1);

          return {
            name: "",
            value: sizeValue,
            itemStyle: {
              color: colorForValue(value),
            },
            label: {
              show: false,
            },
            item: item,
            valueForColor: value,
            companyName: getCompanyName(item),
            silent: false,
            emphasis: {
              disabled: false,
            },
          };
        });

        const industryValue = children.reduce(
          (sum, child) => sum + child.value,
          0,
        );

        const averageValue = calculateAverage(industry.comps);

        return {
          name: industry.key,
          value: industryValue,
          children: children,
          itemStyle: {
            color: colorForValue(averageValue),
          },
          averageValue: averageValue,
          emphasis: {
            disabled: false,
            focus: false,
            blurScope: "coordinateSystem",
            itemStyle: {
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.3)",
            },
          },
        };
      }),
    };
    return data;
  }, [industries, colorForValue, getValue, getCompanyName, calculateAverage]);

  const option = useMemo(() => {
    return {
      series: [
        {
          type: "sunburst",
          data: [sunburstData],
          radius: [0, "90%"],
          nodeClick: false,
          label: {
            show: false,
          },
          silent: false,
          itemStyle: {
            borderWidth: 1,
            borderColor: "var(--black-1)",
          },
          emphasis: {
            focus: false,
            blurScope: "coordinateSystem",
            itemStyle: {
              borderWidth: 2,
              borderColor: "rgba(255, 255, 255, 0.8)",
            },
          },
          levels: [
            {
              r0: "0%",
              r: "35%",
              label: {
                show: true,
                fontSize: 12,
                fontWeight: "bold",
                color: "#fff",
                formatter: (params: any) => {
                  const data = params.data;
                  if (data?.children && data.children.length > 0) {
                    return params.name;
                  }
                  return "";
                },
              },
              emphasis: {
                disabled: false,
                focus: false,
                blurScope: "coordinateSystem",
                itemStyle: {
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.3)",
                },
              },
              itemStyle: {
                borderWidth: 1,
                borderColor: "var(--black-1)",
              },
            },
            {
              r0: "35%",
              r: "90%",
              label: {
                show: false,
                formatter: () => "",
              },
              emphasis: {
                disabled: false,
                focus: false,
                blurScope: "coordinateSystem",
                itemStyle: {
                  borderWidth: 2,
                  borderColor: "rgba(255, 255, 255, 0.8)",
                  shadowBlur: 10,
                  shadowColor: "rgba(255, 255, 255, 0.5)",
                },
              },
              itemStyle: {
                borderWidth: 1,
                borderColor: "var(--black-1)",
              },
              z: 100,
            },
          ],
        },
      ],
      tooltip: {
        trigger: "item",
        enterable: true,
        position: function (point: any) {
          return [point[0] + 10, point[1] + 10];
        },
        formatter: tooltipFormatter,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        borderColor: "rgba(255, 255, 255, 0.2)",
        textStyle: {
          color: "#fff",
        },
        confine: false,
      },
    };
  }, [sunburstData, tooltipFormatter]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center min-h-[500px]">
      <ReactECharts
        option={option}
        style={{ width: "100%", height: "100%", minHeight: "500px" }}
        opts={{ renderer: "svg" }}
        onEvents={{
          click: (params: any) => {
            const data = params.data;
            if (data?.item && onCompanyClick) {
              onCompanyClick(data.item);
            }
          },
        }}
      />
      <div className="mt-4 text-xs text-grey text-center">
        {description && (
          <>
            <p>{description.title}</p>
            <p className="mt-1">{description.subtitle}</p>
          </>
        )}
        {excludedCount !== undefined && excludedCount > 0 && excludedLabel && (
          <p className="mt-1 text-grey/70">
            {excludedCount} {excludedLabel}
          </p>
        )}
      </div>
    </div>
  );
}

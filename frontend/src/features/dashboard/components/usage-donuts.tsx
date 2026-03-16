import { useMemo } from "react";

import { DonutChart } from "@/components/donut-chart";
import type { RemainingItem } from "@/features/dashboard/utils";
import { formatCompactNumber, formatPercentNullable, formatWindowLabel } from "@/utils/formatters";

export type UsageDonutsProps = {
  primaryItems: RemainingItem[];
  secondaryItems: RemainingItem[];
  primaryTotal: number;
  secondaryTotal: number;
  primaryWindowMinutes: number | null;
  secondaryWindowMinutes: number | null;
};

export function UsageDonuts({
  primaryItems,
  secondaryItems,
  primaryTotal,
  secondaryTotal,
  primaryWindowMinutes,
  secondaryWindowMinutes,
}: UsageDonutsProps) {
  const primaryPercentMode =
    primaryTotal <= 0 && primaryItems.some((item) => item.remainingPercent !== null);
  const secondaryPercentMode =
    secondaryTotal <= 0 && secondaryItems.some((item) => item.remainingPercent !== null);

  const primaryPercentValues = primaryItems
    .map((item) => item.remainingPercent)
    .filter((value): value is number => value !== null);
  const secondaryPercentValues = secondaryItems
    .map((item) => item.remainingPercent)
    .filter((value): value is number => value !== null);
  const primaryRemainingSum = primaryItems.reduce((acc, item) => acc + Math.max(0, item.value), 0);
  const secondaryRemainingSum = secondaryItems.reduce((acc, item) => acc + Math.max(0, item.value), 0);

  const primarySummaryPercent =
    primaryPercentMode && primaryPercentValues.length > 0
      ? primaryPercentValues.reduce((acc, value) => acc + value, 0) / primaryPercentValues.length
      : undefined;
  const secondarySummaryPercent =
    secondaryPercentMode && secondaryPercentValues.length > 0
      ? secondaryPercentValues.reduce((acc, value) => acc + value, 0) / secondaryPercentValues.length
      : undefined;
  const primarySummaryCreditsPercent =
    primaryTotal > 0 ? (primaryRemainingSum / primaryTotal) * 100 : null;
  const secondarySummaryCreditsPercent =
    secondaryTotal > 0 ? (secondaryRemainingSum / secondaryTotal) * 100 : null;
  const primarySummaryText = primaryPercentMode
    ? formatPercentNullable(primarySummaryPercent ?? null)
    : primaryTotal > 0
      ? `${formatCompactNumber(primaryRemainingSum)} / ${formatCompactNumber(primaryTotal)} (${formatPercentNullable(primarySummaryCreditsPercent)})`
      : formatCompactNumber(primaryRemainingSum);
  const secondarySummaryText = secondaryPercentMode
    ? formatPercentNullable(secondarySummaryPercent ?? null)
    : secondaryTotal > 0
      ? `${formatCompactNumber(secondaryRemainingSum)} / ${formatCompactNumber(secondaryTotal)} (${formatPercentNullable(secondarySummaryCreditsPercent)})`
      : formatCompactNumber(secondaryRemainingSum);

  const primaryChartItems = useMemo(
    () =>
      primaryItems.map((item) => {
        const hasCapacity = item.capacityCredits > 0;
        const percentValue = Math.max(0, item.remainingPercent ?? 0);
        const showPercent = primaryPercentMode || (!hasCapacity && item.remainingPercent !== null);
        const percentLabel = formatPercentNullable(item.remainingPercent);
        const creditsLabel = formatCompactNumber(item.value);
        const srValue = showPercent
          ? percentLabel
          : item.remainingPercent !== null
            ? `${creditsLabel} kredytów, ${percentLabel}`
            : `${creditsLabel} kredytów`;
        return {
          label: item.label,
          value: primaryPercentMode ? percentValue : item.value,
          displayValue: showPercent ? percentLabel : undefined,
          srValue,
          color: item.color,
        };
      }),
    [primaryItems, primaryPercentMode],
  );
  const secondaryChartItems = useMemo(
    () =>
      secondaryItems.map((item) => {
        const hasCapacity = item.capacityCredits > 0;
        const percentValue = Math.max(0, item.remainingPercent ?? 0);
        const showPercent = secondaryPercentMode || (!hasCapacity && item.remainingPercent !== null);
        const percentLabel = formatPercentNullable(item.remainingPercent);
        const creditsLabel = formatCompactNumber(item.value);
        const srValue = showPercent
          ? percentLabel
          : item.remainingPercent !== null
            ? `${creditsLabel} kredytów, ${percentLabel}`
            : `${creditsLabel} kredytów`;
        return {
          label: item.label,
          value: secondaryPercentMode ? percentValue : item.value,
          displayValue: showPercent ? percentLabel : undefined,
          srValue,
          color: item.color,
        };
      }),
    [secondaryItems, secondaryPercentMode],
  );

  const primaryTotalValue =
    primaryPercentMode ? primaryPercentValues.length * 100 : primaryTotal;
  const secondaryTotalValue =
    secondaryPercentMode ? secondaryPercentValues.length * 100 : secondaryTotal;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <DonutChart
        title="Pozostało (główne)"
        subtitle={`Okno ${formatWindowLabel("primary", primaryWindowMinutes)}`}
        items={primaryChartItems}
        total={primaryTotalValue}
        summaryText={primarySummaryText}
      />
      <DonutChart
        title="Pozostało (wtórne)"
        subtitle={`Okno ${formatWindowLabel("secondary", secondaryWindowMinutes)}`}
        items={secondaryChartItems}
        total={secondaryTotalValue}
        summaryText={secondarySummaryText}
      />
    </div>
  );
}

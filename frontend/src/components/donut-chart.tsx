import { Cell, Pie, PieChart } from "recharts";

import { buildDonutPalette } from "@/utils/colors";
import { formatCompactNumber } from "@/utils/formatters";
import { useThemeStore } from "@/hooks/use-theme";

export type DonutChartItem = {
  label: string;
  value: number;
  color?: string;
  displayValue?: string;
  srValue?: string;
};

export type DonutChartProps = {
  items: DonutChartItem[];
  total: number;
  title: string;
  subtitle?: string;
  valueFormatter?: (value: number) => string;
  summaryText?: string;
};

export function DonutChart({
  items,
  total,
  title,
  subtitle,
  valueFormatter,
  summaryText,
}: DonutChartProps) {
  const isDark = useThemeStore((s) => s.theme === "dark");
  const consumedColor = isDark ? "#404040" : "#d3d3d3";
  const palette = buildDonutPalette(items.length, isDark);
  const normalizedItems = items.map((item, index) => ({
    ...item,
    color: item.color ?? palette[index % palette.length],
  }));
  const formatValue = valueFormatter ?? formatCompactNumber;

  const remainingSum = normalizedItems.reduce((acc, item) => acc + Math.max(0, item.value), 0);
  const consumed = Math.max(0, total - remainingSum);

  const chartData = [
    ...normalizedItems.map((item) => ({
      name: item.label,
      value: Math.max(0, item.value),
      fill: item.color,
    })),
    ...(consumed > 0
      ? [{ name: "__consumed__", value: consumed, fill: consumedColor }]
      : []),
  ];

  const hasData = chartData.some((d) => d.value > 0);
  const displayRemaining = summaryText ?? (hasData ? formatValue(remainingSum) : "--");
  const chartSummary = [
    title,
    subtitle ? subtitle : null,
    `Pozostało ${displayRemaining}`,
  ]
    .filter(Boolean)
    .join(". ");
  if (!hasData) {
    chartData.length = 0;
    chartData.push({ name: "__empty__", value: 1, fill: consumedColor });
  }

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-5">
        <h3 className="text-sm font-semibold">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>

      <div className="flex items-center gap-6">
        <div
          className="relative h-36 w-36 shrink-0 overflow-visible"
          role="img"
          aria-label={chartSummary}
        >
          <PieChart width={144} height={144} margin={{ top: 1, right: 1, bottom: 1, left: 1 }}>
            <Pie
              data={chartData}
              cx={71}
              cy={71}
              innerRadius={53}
              outerRadius={71}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
              isAnimationActive={true}
              animationDuration={600}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
          <div className="absolute inset-[18px] flex items-center justify-center rounded-full text-center pointer-events-none">
            <div aria-hidden="true">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Pozostało</p>
              <p className="text-base font-semibold tabular-nums">{displayRemaining}</p>
            </div>
          </div>
        </div>

        <table className="flex-1 w-full text-xs">
          <thead className="sr-only">
            <tr>
              <th scope="col">Konto</th>
              <th scope="col">Pozostało</th>
            </tr>
          </thead>
          <tbody>
            {normalizedItems.map((item, i) => (
              <tr
                key={item.label}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 75}ms` }}
              >
                <td className="pr-3">
                  <span className="sr-only">{`${item.label}: ${
                    item.srValue ?? item.displayValue ?? formatValue(item.value)
                  }.`}</span>
                  <div className="flex min-w-0 items-center gap-2" aria-hidden="true">
                    <span
                      aria-hidden
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="truncate font-medium">{item.label}</span>
                  </div>
                </td>
                <td className="text-right tabular-nums text-muted-foreground" aria-hidden="true">
                  {item.displayValue ?? formatValue(item.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

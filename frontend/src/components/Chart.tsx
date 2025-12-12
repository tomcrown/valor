import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { ValueDataPoint } from "@/data/apiData";

interface ChartProps {
  data: ValueDataPoint[];
  height?: number;
  showLabels?: boolean;
  className?: string;
}

const Chart = ({
  data,
  height = 200,
  showLabels = true,
  className,
}: ChartProps) => {
  const { points, minValue, maxValue, range } = useMemo(() => {
    const values = data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const r = max - min || 1;

    const pts = data.map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = ((d.value - min) / r) * 100;
      return { x, y: 100 - y, value: d.value, label: d.date };
    });

    return { points: pts, minValue: min, maxValue: max, range: r };
  }, [data]);

  const pathD = useMemo(() => {
    if (points.length < 2) return "";

    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx1 = prev.x + (curr.x - prev.x) / 3;
      const cpx2 = prev.x + (2 * (curr.x - prev.x)) / 3;
      d += ` C ${cpx1} ${prev.y}, ${cpx2} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    return d;
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length < 2) return "";
    return `${pathD} L 100 100 L 0 100 Z`;
  }, [pathD, points]);

  const isPositive =
    data.length >= 2 && data[data.length - 1].value >= data[0].value;

  return (
    <div className={cn("relative", className)} style={{ height }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop
              offset="0%"
              stopColor={
                isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"
              }
              stopOpacity="0.3"
            />
            <stop
              offset="100%"
              stopColor={
                isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"
              }
              stopOpacity="0"
            />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--secondary))" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="hsl(var(--border))"
            strokeWidth="0.3"
            strokeDasharray="2,2"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#chartGradient)" />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className="drop-shadow-lg"
        />

        {/* Data points */}
        {points.map((point, i) => (
          <g key={i}>
            <circle
              cx={point.x}
              cy={point.y}
              r="1.5"
              fill="hsl(var(--primary))"
              className="drop-shadow-lg"
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx={point.x}
              cy={point.y}
              r="3"
              fill="transparent"
              className="cursor-pointer hover:fill-primary/20"
            >
              <title>
                {point.label}: ${point.value.toLocaleString()}
              </title>
            </circle>
          </g>
        ))}
      </svg>

      {/* Labels */}
      {showLabels && (
        <div className="flex justify-between mt-2 px-1">
          {data.map((d, i) => (
            <span key={i} className="text-xs text-muted-foreground">
              {d.date}
            </span>
          ))}
        </div>
      )}

      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 h-full flex flex-col justify-between -translate-x-full pr-2 py-1">
        <span className="text-xs text-muted-foreground">
          ${maxValue.toLocaleString()}
        </span>
        <span className="text-xs text-muted-foreground">
          ${minValue.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default Chart;

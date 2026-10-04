import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Recharts paints SVG attributes, which cannot resolve CSS var() references,
// so concrete colors are read from computed styles of probe elements that
// carry the real token utility classes. Nothing is hardcoded here.
const BAR_CLASSES = {
  accent: "bg-accent",
  success: "bg-success",
};

const PROBE_CLASSES = {
  grid: "border border-border",
  axis: "text-text-muted",
  text: "text-text-primary",
  surface: "bg-surface",
  cursor: "bg-surface-secondary",
};

function readChartColors(barClass) {
  const probe = document.createElement("div");
  probe.style.position = "fixed";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  document.body.appendChild(probe);

  const read = (className, property) => {
    probe.className = className;
    return getComputedStyle(probe)[property];
  };

  const colors = {
    bar: read(barClass, "backgroundColor"),
    grid: read(PROBE_CLASSES.grid, "borderTopColor"),
    axis: read(PROBE_CLASSES.axis, "color"),
    text: read(PROBE_CLASSES.text, "color"),
    surface: read(PROBE_CLASSES.surface, "backgroundColor"),
    cursor: read(PROBE_CLASSES.cursor, "backgroundColor"),
  };

  document.body.removeChild(probe);
  return colors;
}

/**
 * One honest question per chart: pass the metric's daily series and how to
 * format a value; the card renders title, optional summary line, bars.
 * @param {{ title: string, summary?: string,
 *   data: Array<Record<string, unknown>>, dataKey: string,
 *   barClass: "accent" | "success",
 *   valueFormatter: (value: number) => string }} props
 */
export function DailyBarChart({
  title,
  summary,
  data,
  dataKey,
  barClass,
  valueFormatter,
}) {
  const [colors] = useState(() => readChartColors(BAR_CLASSES[barClass]));

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
        {summary && <p className="text-xs text-text-muted">{summary}</p>}
      </div>
      <div className="mt-4 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={colors.grid}
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              minTickGap={20}
              tick={{ fill: colors.axis, fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              width={44}
              tick={{ fill: colors.axis, fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: colors.cursor }}
              contentStyle={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.grid}`,
                borderRadius: 8,
                fontSize: 12,
                color: colors.text,
              }}
              formatter={(value) => [valueFormatter(value), title]}
            />
            <Bar
              dataKey={dataKey}
              fill={colors.bar}
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

import { cn } from "@/lib/utils";
import { ENERGY_LEVEL } from "@/lib/constants";

const ENERGY_OPTIONS = [
  { value: ENERGY_LEVEL.HIGH, label: "High" },
  { value: ENERGY_LEVEL.MEDIUM, label: "Medium" },
  { value: ENERGY_LEVEL.LOW, label: "Low" },
];

export function EnergySelector({ value, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-text-muted">Energy right now</span>
      {ENERGY_OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(selected ? null : option.value)}
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
              selected
                ? "border-transparent bg-accent-light text-accent"
                : "border-border text-text-secondary hover:border-accent hover:text-accent",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

import { classNames } from "../../services/classNames";

type Props<T extends string> = {
  value: T;
  items: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({ value, items, onChange }: Props<T>) {
  return (
    <div className="inline-flex rounded-xl border border-border bg-zinc-950 p-1">
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          className={classNames(
            "rounded-lg px-3 py-1.5 text-xs transition",
            value === item.value ? "bg-accent/15 text-accent" : "text-muted hover:text-text"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

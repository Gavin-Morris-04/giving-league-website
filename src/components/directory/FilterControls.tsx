"use client";

/** Shared filter controls for the Volunteer Finder and the Charity Events directory. */
export function Segmented<T extends string>({
  legend,
  name,
  value,
  options,
  onChange,
}: {
  legend: string;
  name: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="text-label mb-2.5 text-ink-muted">{legend}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <label
            key={o.value}
            className="relative inline-flex min-h-10 cursor-pointer items-center rounded-sm border border-hairline-strong bg-paper px-3 text-[0.875rem] font-medium text-ink transition-colors hover:border-ink has-checked:border-forest has-checked:bg-forest has-checked:text-white has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-forest"
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

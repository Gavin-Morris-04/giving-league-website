"use client";

import { usePathname } from "next/navigation";
import { createContext, useActionState, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, Loader2 } from "lucide-react";
import { submitForm } from "@/app/actions/forms";
import { Button } from "@/components/ui/Button";
import { cx } from "@/lib/format";
import type { FormState } from "@/lib/types";
import { fieldErrorsFrom, schemas, type SchemaKey } from "@/lib/validation";

type Ctx = { errors: Record<string, string>; values: Record<string, string>; formId: string; clearError: (name: string) => void };
const FormCtx = createContext<Ctx>({ errors: {}, values: {}, formId: "", clearError: () => {} });
const useForm = () => useContext(FormCtx);

const initial: FormState = { status: "idle" };

function collect(form: HTMLFormElement) {
  const fd = new FormData(form);
  const out: Record<string, string> = {};
  for (const [k, v] of fd.entries()) {
    if (typeof v !== "string") continue;
    out[k] = out[k] ? `${out[k]},${v}` : v;
  }
  return out;
}

/**
 * Accessible form shell: client-side validation with the same zod schema the server uses, an error summary
 * that receives focus, inline field errors, a pending state, and full-panel success / not-configured states.
 */
export function FormShell({
  kind,
  submitLabel,
  children,
  className,
  compact = false,
  tone = "light",
  successTitle = "Received",
}: {
  kind: SchemaKey;
  submitLabel: string;
  children: ReactNode;
  className?: string;
  compact?: boolean;
  tone?: "light" | "dark";
  successTitle?: string;
}) {
  const action = submitForm.bind(null, kind);
  const [state, formAction, pending] = useActionState(action, initial);
  const [clientErrors, setClientErrors] = useState<Record<string, string> | null>(null);
  const [dismissed, setDismissed] = useState<FormState | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const formId = useId();
  const pathname = usePathname();

  const serverErrors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const errors = clientErrors ?? serverErrors;
  const values = state.values ?? {};
  const hasErrors = Object.keys(errors).length > 0;
  const showPanel = (state.status === "success" || state.status === "not_configured") && dismissed !== state;

  useEffect(() => {
    if (state.status === "error") summaryRef.current?.focus();
    if (state.status === "success" || state.status === "not_configured") panelRef.current?.focus();
  }, [state]);

  const ctx: Ctx = {
    errors,
    values,
    formId,
    clearError: (name) => {
      if (!errors[name]) return;
      const next = { ...errors };
      delete next[name];
      setClientErrors(next);
    },
  };

  if (showPanel) {
    const ok = state.status === "success";
    return (
      <div
        ref={panelRef}
        tabIndex={-1}
        role="status"
        className={cx(
          "rounded-md border p-6 outline-none sm:p-8",
          ok ? "border-forest/30 bg-forest-tint text-ink" : "border-gold/60 bg-gold-tint text-ink",
          className,
        )}
      >
        <div className="flex items-start gap-3">
          {ok ? (
            <CheckCircle2 aria-hidden className="mt-0.5 size-6 shrink-0 text-forest" />
          ) : (
            <Info aria-hidden className="mt-0.5 size-6 shrink-0 text-gold-ink" />
          )}
          <div>
            <h3 className="text-h3 text-navy">{ok ? successTitle : "Submissions aren't switched on yet"}</h3>
            <p className="mt-2 text-ink">{state.message}</p>
            <button
              type="button"
              onClick={() => setDismissed(state)}
              className="link mt-4 inline-flex min-h-11 items-center font-semibold"
            >
              {ok ? "Send another response" : "Back to the form"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <FormCtx.Provider value={ctx}>
      <form
        action={formAction}
        noValidate
        aria-describedby={hasErrors ? `${formId}-summary` : undefined}
        className={cx("relative", tone === "dark" && "on-dark", className)}
        onSubmit={(e) => {
          const data = collect(e.currentTarget);
          delete data.company_website;
          delete data.source_path;
          const parsed = schemas[kind].safeParse(data);
          if (!parsed.success) {
            e.preventDefault();
            setClientErrors(fieldErrorsFrom(parsed.error));
            requestAnimationFrame(() => summaryRef.current?.focus());
          } else {
            setClientErrors(null);
          }
        }}
      >
        <div
          ref={summaryRef}
          tabIndex={-1}
          id={`${formId}-summary`}
          aria-live="assertive"
          className={cx(
            "outline-none",
            (hasErrors || state.status === "error") &&
              "mb-6 rounded-md border border-error/40 bg-error-tint p-4 text-[0.9375rem] text-ink",
          )}
        >
          {hasErrors || state.status === "error" ? (
            <div className="flex gap-2.5">
              <AlertCircle aria-hidden className="mt-0.5 size-5 shrink-0 text-error" />
              <div>
                <p className="font-semibold">
                  {hasErrors
                    ? `Please fix ${Object.keys(errors).length === 1 ? "1 field" : `${Object.keys(errors).length} fields`} and try again.`
                    : state.message}
                </p>
                {hasErrors ? (
                  <ul className="mt-1.5 list-disc pl-5">
                    {Object.entries(errors).map(([name, msg]) => (
                      <li key={name}>
                        <a className="underline underline-offset-2" href={`#${formId}-${name}`}>
                          {msg}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <input type="hidden" name="source_path" value={pathname} />
        {/* Honeypot — hidden from people and assistive tech */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            Company website
            <input type="text" name="company_website" tabIndex={-1} autoComplete="off" defaultValue="" />
          </label>
        </div>

        <div className={cx("grid gap-5", !compact && "sm:grid-cols-2")}>{children}</div>

        <div className={cx("mt-7 flex flex-wrap items-center gap-4")}>
          <Button type="submit" variant={tone === "dark" ? "dark" : "primary"} size="lg" disabled={pending} className="w-full sm:w-auto">
            {pending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
            {pending ? "Sending…" : submitLabel}
          </Button>
          <p className={cx("text-[0.8125rem]", tone === "dark" ? "text-navy-muted" : "text-ink-muted")}>
            We use your details only to respond. See our{" "}
            <a href="/privacy" className="link">
              privacy policy
            </a>
            .
          </p>
        </div>
      </form>
    </FormCtx.Provider>
  );
}

/* ── Field primitives ─────────────────────────────────────────────────── */

function FieldWrap({
  name,
  label,
  hint,
  required,
  full,
  children,
}: {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  full?: boolean;
  children: (p: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
}) {
  const { errors, formId } = useForm();
  const id = `${formId}-${name}`;
  const err = errors[name];
  const describedBy = [hint && `${id}-hint`, err && `${id}-err`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cx("flex flex-col gap-2", full && "sm:col-span-2")}>
      <label htmlFor={id} className="flex items-baseline justify-between gap-3 text-[0.9375rem] font-semibold">
        <span>{label}</span>
        <span className="text-label font-medium text-ink-muted normal-case tracking-normal">{required ? "Required" : "Optional"}</span>
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="-mt-1 text-[0.8125rem] text-ink-muted">
          {hint}
        </p>
      ) : null}
      {children({ id, describedBy, invalid: Boolean(err) })}
      {err ? (
        <p id={`${id}-err`} className="flex items-center gap-1.5 text-[0.875rem] font-medium text-error">
          <AlertCircle aria-hidden className="size-4 shrink-0" />
          {err}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({
  name,
  label,
  type = "text",
  required,
  hint,
  full,
  autoComplete,
  placeholder,
  defaultValue,
  inputMode,
}: {
  name: string;
  label: string;
  type?: "text" | "email" | "url" | "date" | "tel" | "number";
  required?: boolean;
  hint?: string;
  full?: boolean;
  autoComplete?: string;
  placeholder?: string;
  defaultValue?: string;
  inputMode?: "numeric" | "email" | "url" | "text";
}) {
  const { values, clearError } = useForm();
  return (
    <FieldWrap name={name} label={label} hint={hint} required={required} full={full}>
      {({ id, describedBy, invalid }) => (
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          inputMode={inputMode}
          defaultValue={values[name] ?? defaultValue}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={() => clearError(name)}
          className="field"
        />
      )}
    </FieldWrap>
  );
}

export function TextArea({ name, label, required, hint, rows = 5 }: { name: string; label: string; required?: boolean; hint?: string; rows?: number }) {
  const { values, clearError } = useForm();
  return (
    <FieldWrap name={name} label={label} hint={hint} required={required} full>
      {({ id, describedBy, invalid }) => (
        <textarea
          id={id}
          name={name}
          rows={rows}
          required={required}
          defaultValue={values[name]}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={() => clearError(name)}
          className="field"
        />
      )}
    </FieldWrap>
  );
}

export function SelectField({
  name,
  label,
  options,
  required,
  hint,
  full,
  defaultValue,
  placeholder = "Choose one",
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  required?: boolean;
  hint?: string;
  full?: boolean;
  defaultValue?: string;
  placeholder?: string;
}) {
  const { values, clearError } = useForm();
  return (
    <FieldWrap name={name} label={label} hint={hint} required={required} full={full}>
      {({ id, describedBy, invalid }) => (
        <select
          id={id}
          name={name}
          required={required}
          defaultValue={values[name] ?? defaultValue ?? ""}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={() => clearError(name)}
          className="field"
        >
          <option value="" disabled={required}>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </FieldWrap>
  );
}

export function RadioGroup({
  name,
  legend,
  options,
  required,
  defaultValue,
}: {
  name: string;
  legend: string;
  options: { value: string; label: string }[];
  required?: boolean;
  defaultValue?: string;
}) {
  const { errors, values, formId, clearError } = useForm();
  const err = errors[name];
  return (
    <fieldset className="sm:col-span-2" aria-describedby={err ? `${formId}-${name}-err` : undefined}>
      <legend className="mb-2 flex w-full items-baseline justify-between gap-3 text-[0.9375rem] font-semibold">
        <span>{legend}</span>
        <span className="text-label font-medium text-ink-muted normal-case tracking-normal">{required ? "Required" : "Optional"}</span>
      </legend>
      <div id={`${formId}-${name}`} tabIndex={-1} className="flex flex-wrap gap-2 outline-none">
        {options.map((o) => (
          <label
            key={o.value}
            className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-sm border border-hairline-strong bg-paper px-3.5 py-2 text-[0.9375rem] has-checked:border-forest has-checked:bg-forest-tint has-focus-visible:outline-3 has-focus-visible:outline-forest"
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              defaultChecked={(values[name] ?? defaultValue) === o.value}
              onChange={() => clearError(name)}
              className="check"
            />
            {o.label}
          </label>
        ))}
      </div>
      {err ? (
        <p id={`${formId}-${name}-err`} className="mt-2 flex items-center gap-1.5 text-[0.875rem] font-medium text-error">
          <AlertCircle aria-hidden className="size-4 shrink-0" />
          {err}
        </p>
      ) : null}
    </fieldset>
  );
}

export function Consent({ label }: { label: string }) {
  const { errors, formId, clearError } = useForm();
  const err = errors.consent;
  return (
    <div className="sm:col-span-2">
      <label className="flex cursor-pointer items-start gap-3 text-[0.9375rem]">
        <input
          id={`${formId}-consent`}
          type="checkbox"
          name="consent"
          className="check mt-0.5"
          aria-invalid={Boolean(err) || undefined}
          aria-describedby={err ? `${formId}-consent-err` : undefined}
          onChange={() => clearError("consent")}
        />
        <span>{label}</span>
      </label>
      {err ? (
        <p id={`${formId}-consent-err`} className="mt-2 flex items-center gap-1.5 text-[0.875rem] font-medium text-error">
          <AlertCircle aria-hidden className="size-4 shrink-0" />
          {err}
        </p>
      ) : null}
    </div>
  );
}

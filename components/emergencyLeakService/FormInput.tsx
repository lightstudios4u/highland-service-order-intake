import { ChangeEvent } from "react";

/**
 * Formats a raw digit string into (XXX) XXX-XXXX as the user types.
 */
function formatPhoneNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

type FormInputProps = {
  id: string;
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type?: "text" | "email" | "tel";
  placeholder?: string;
  previewing?: boolean;
};

export function FormInput({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  previewing = false,
}: FormInputProps) {
  const isTel = type === "tel";

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (isTel) {
      const formatted = formatPhoneNumber(event.target.value);
      const syntheticEvent = {
        ...event,
        target: { ...event.target, value: formatted },
      } as ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    } else {
      onChange(event);
    }
  }

  return (
    <label
      className="flex flex-col gap-2 text-sm font-semibold text-slate-800"
      htmlFor={id}
    >
      {label}
      <input
        id={id}
        name={id}
        value={value}
        onChange={handleChange}
        type={isTel ? "tel" : type}
        inputMode={isTel ? "tel" : undefined}
        placeholder={placeholder}
        className={`w-full rounded-md border px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 ${
          previewing
            ? "border-amber-300 bg-amber-50"
            : "border-slate-300 bg-white"
        }`}
      />
      {error ? (
        <span className="text-xs font-medium text-red-600">{error}</span>
      ) : null}
    </label>
  );
}

type FormTextareaProps = {
  id: string;
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  className?: string;
  previewing?: boolean;
};

export function FormTextarea({
  id,
  label,
  value,
  onChange,
  error,
  className,
  previewing = false,
}: FormTextareaProps) {
  return (
    <label
      className={
        className ?? "flex flex-col gap-2 text-sm font-semibold text-slate-800"
      }
      htmlFor={id}
    >
      {label}
      <textarea
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        className={`min-h-28 w-full rounded-md border px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 ${
          previewing
            ? "border-amber-300 bg-amber-50"
            : "border-slate-300 bg-white"
        }`}
      />
      {error ? (
        <span className="text-xs font-medium text-red-600">{error}</span>
      ) : null}
    </label>
  );
}

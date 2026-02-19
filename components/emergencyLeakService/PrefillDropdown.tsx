"use client";

import { useCallback, useRef, useState, useEffect } from "react";

export type PrefillOption<T> = {
  label: string;
  description?: string;
  value: T;
};

type PrefillDropdownProps<T> = {
  options: PrefillOption<T>[];
  onSelect: (value: T) => void;
  onPreview?: (value: T | null) => void;
  accentColor: "green" | "navy" | "orange";
};

const accentStyles = {
  green: {
    button:
      "border-[#2f9750]/40 bg-[#2f9750]/10 text-[#2f9750] hover:bg-[#2f9750]/20 focus:ring-[#2f9750]/30",
    buttonDisabled: "border-slate-200 bg-slate-50 text-slate-400",
    badge: "bg-[#2f9750] text-white",
  },
  navy: {
    button:
      "border-[#1e2a3a]/40 bg-[#1e2a3a]/10 text-[#1e2a3a] hover:bg-[#1e2a3a]/20 focus:ring-[#1e2a3a]/30",
    buttonDisabled: "border-slate-200 bg-slate-50 text-slate-400",
    badge: "bg-[#1e2a3a] text-white",
  },
  orange: {
    button:
      "border-[#f58a1f]/40 bg-[#f58a1f]/10 text-[#b5600a] hover:bg-[#f58a1f]/20 focus:ring-[#f58a1f]/30",
    buttonDisabled: "border-slate-200 bg-slate-50 text-slate-400",
    badge: "bg-[#f58a1f] text-white",
  },
};

export default function PrefillDropdown<T>({
  options,
  onSelect,
  onPreview,
  accentColor,
}: PrefillDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const disabled = options.length === 0;
  const styles = accentStyles[accentColor];

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setHoveredIndex(null);
    onPreview?.(null);
  }, [onPreview]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, closeDropdown]);

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-3">
        <span className="shrink-0 text-sm font-semibold text-slate-700">
          Pre-fill Options:
        </span>
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (isOpen) {
              closeDropdown();
            } else {
              setIsOpen(true);
            }
          }}
          className={`inline-flex w-full items-center justify-between gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 ${
            disabled
              ? `${styles.buttonDisabled} cursor-not-allowed`
              : styles.button
          }`}
        >
          <span>
            {disabled
              ? "No options available"
              : `${options.length} option${options.length === 1 ? "" : "s"} available`}
          </span>
          <svg
            className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {isOpen && options.length > 0 && (
        <ul className="absolute left-0 right-0 z-30 mt-1 max-h-60 overflow-auto rounded-md border border-slate-200 bg-white shadow-lg">
          {options.map((option, index) => (
            <li
              key={index}
              onMouseEnter={() => {
                setHoveredIndex(index);
                onPreview?.(option.value);
              }}
              onMouseLeave={() => {
                setHoveredIndex(null);
                onPreview?.(null);
              }}
              onClick={() => {
                onSelect(option.value);
                setIsOpen(false);
                setHoveredIndex(null);
                onPreview?.(null);
              }}
              className={`cursor-pointer border-b border-slate-100 px-4 py-3 text-sm transition last:border-b-0 ${
                hoveredIndex === index ? "bg-slate-100" : ""
              }`}
            >
              <p className="font-semibold text-slate-900">{option.label}</p>
              {option.description && (
                <p className="mt-0.5 text-xs text-slate-500">
                  {option.description}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";

import Image from "next/image";
import { useState } from "react";

type IntakeHeaderProps = {
  onReset?: () => void;
  isResetDisabled?: boolean;
  lookupValue: string;
  onLookupValueChange: (value: string) => void;
  onLookupByEmail: () => void;
  onLookupByServiceOrder: () => void;
  isLookingUp: boolean;
  lookupMessage: string;
};

export default function IntakeHeader({
  onReset,
  isResetDisabled,
  lookupValue,
  onLookupValueChange,
  onLookupByEmail,
  onLookupByServiceOrder,
  isLookingUp,
  lookupMessage,
}: IntakeHeaderProps) {
  const [lookupMode, setLookupMode] = useState<"email" | "serviceOrder">(
    "serviceOrder",
  );

  function handleLookup() {
    if (!lookupValue.trim() || isLookingUp) return;
    if (lookupMode === "email") {
      onLookupByEmail();
    } else {
      onLookupByServiceOrder();
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleLookup();
    }
  }

  return (
    <header className="relative overflow-hidden bg-slate-900 px-6 py-7 text-white md:px-10">
      <div className="absolute inset-0">
        <Image
          src="/droneshot.png"
          alt=""
          fill
          className="object-cover opacity-25"
          priority
        />
        <div className="absolute inset-0 bg-slate-900/75" />
      </div>

      <div className="relative z-10 mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Image
          src="/New-Logo-Final-White-1.svg"
          alt="Highland Commercial Roofing"
          width={210}
          height={42}
          className="h-auto w-[180px] sm:w-[210px]"
          priority
        />
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <h1 className="inline-block bg-red-900/35 px-3 py-2 text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">
            EMERGENCY LEAK SERVICE REQUEST
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-slate-200 md:text-base">
            Highland provides fast and reliable emergency leak repair services.
          </p>
        </div>
      </div>

      <div className="relative z-10 border-t border-slate-700 pt-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-white">
              Customer Lookup:
            </span>
            <label className="flex cursor-pointer items-center gap-1.5 text-sm text-slate-200">
              <input
                type="radio"
                name="lookupMode"
                checked={lookupMode === "serviceOrder"}
                onChange={() => setLookupMode("serviceOrder")}
                className="accent-[#2f9750]"
              />
              Service Order / Ref #
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 text-sm text-slate-200">
              <input
                type="radio"
                name="lookupMode"
                checked={lookupMode === "email"}
                onChange={() => setLookupMode("email")}
                className="accent-[#2f9750]"
              />
              Email
            </label>
            <input
              type={lookupMode === "email" ? "email" : "text"}
              value={lookupValue}
              onChange={(e) => onLookupValueChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                lookupMode === "email"
                  ? "john@company.com"
                  : "ELS-26-01-4837 or ref ID"
              }
              className="w-48 rounded-md border border-slate-500 bg-slate-800/60 px-3 py-1.5 text-sm text-white placeholder-slate-400 outline-none transition focus:border-[#2f9750] focus:ring-1 focus:ring-[#2f9750] sm:w-56"
            />
            <button
              type="button"
              onClick={handleLookup}
              disabled={isLookingUp || !lookupValue.trim()}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#2f9750] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-[#268a45] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLookingUp && (
                <svg
                  className="h-3.5 w-3.5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              )}
              {isLookingUp ? "Searching…" : "Lookup"}
            </button>
          </div>

          {onReset && (
            <div className="flex items-center gap-2">
              {/* <div className="hidden h-6 w-px bg-slate-500 sm:block" /> */}
              <button
                type="button"
                onClick={onReset}
                disabled={isResetDisabled}
                title="Clear all form fields and start over"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-red-400/40 bg-red-900/25 px-3 py-1.5 text-sm font-medium text-red-200 transition hover:border-red-400/60 hover:bg-red-900/40 hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <svg
                  className="h-3.5 w-3.5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.992 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182"
                  />
                </svg>
                Clear Form
              </button>
            </div>
          )}
        </div>

        {lookupMessage && (
          <p className="mt-2 rounded-md bg-slate-800/50 px-3 py-1.5 text-sm text-slate-200">
            {lookupMessage}
          </p>
        )}
      </div>
    </header>
  );
}

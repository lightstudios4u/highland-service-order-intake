"use client";

import { useRef, useEffect, useCallback } from "react";
import SignatureCanvas from "react-signature-canvas";
import { LuPenLine, LuEraser } from "react-icons/lu";

type SignatureSectionProps = {
  /** Base-64 PNG data URL, or empty string if not signed */
  value: string;
  onChange: (dataUrl: string) => void;
  error?: string;
  signatureName: string;
  onSignatureNameChange: (name: string) => void;
  signatureNameError?: string;
  billingTermsAcknowledged: boolean;
  onBillingTermsChange: (checked: boolean) => void;
  billingTermsError?: string;
};

export default function SignatureSection({
  value,
  onChange,
  error,
  signatureName,
  onSignatureNameChange,
  signatureNameError,
  billingTermsAcknowledged,
  onBillingTermsChange,
  billingTermsError,
}: SignatureSectionProps) {
  const sigRef = useRef<SignatureCanvas | null>(null);

  // Sync external value into canvas (e.g. after clear form)
  useEffect(() => {
    if (!value && sigRef.current && !sigRef.current.isEmpty()) {
      sigRef.current.clear();
    }
  }, [value]);

  const handleEnd = useCallback(() => {
    if (sigRef.current && !sigRef.current.isEmpty()) {
      onChange(sigRef.current.toDataURL("image/png"));
    }
  }, [onChange]);

  function handleClear() {
    sigRef.current?.clear();
    onChange("");
  }

  return (
    <section className="overflow-hidden rounded-lg border border-slate-300">
      <div className="bg-slate-700 px-4 py-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
          <LuPenLine className="text-xl" /> Signature
        </h2>
      </div>
      <div className="bg-white p-4">
        <div className="mb-4 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
          <p>
            If this is a warranty related leak repair there will be no charge
            for the service call or the repairs. Our billing rate for
            non-warranty leak service calls is as follows:
          </p>
          <p className="mt-2 font-semibold">
            Pricing &ndash; $850 Trip Charge &ndash; includes travel time,
            setup, breakdown and 2 man-hours labor and materials.
          </p>
          <p className="mt-1 font-semibold">
            Additional time will be charged at $195 per man-hour.
          </p>
          <br />
          <label className="flex items-start gap-2 text-sm font-semibold text-slate-800">
            <input
              type="checkbox"
              checked={billingTermsAcknowledged}
              onChange={(e) => onBillingTermsChange(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            I acknowledge reviewing the billing terms for non-warranty work
          </label>

          {billingTermsError && (
            <span className="mt-1 block text-xs font-medium text-red-600">
              {billingTermsError}
            </span>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="signatureName"
            className="mb-1 block text-sm font-semibold text-slate-800"
          >
            Name
          </label>
          <input
            id="signatureName"
            type="text"
            value={signatureName}
            onChange={(e) => onSignatureNameChange(e.target.value)}
            placeholder="Full name"
            className={`w-full rounded-md border px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 ${
              signatureNameError
                ? "border-red-400 bg-red-50/30"
                : "border-slate-300 bg-white"
            }`}
          />
          {signatureNameError && (
            <span className="mt-1 text-xs font-medium text-red-600">
              {signatureNameError}
            </span>
          )}
        </div>

        <p className="mb-3 text-sm text-slate-600">
          Please sign below to confirm the information provided is accurate.
        </p>

        <div
          className={`relative rounded-md border-2 border-dashed ${
            error
              ? "border-red-400 bg-red-50/30"
              : "border-slate-300 bg-slate-50"
          }`}
        >
          <SignatureCanvas
            ref={sigRef}
            penColor="#1e293b"
            canvasProps={{
              className: "w-full h-40 cursor-crosshair",
              style: { touchAction: "none" },
            }}
            onEnd={handleEnd}
          />

          {/* Watermark hint */}
          {!value && (
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-slate-400 select-none">
              Sign here
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between">
          {error ? (
            <span className="text-xs font-medium text-red-600">{error}</span>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            <LuEraser className="h-3.5 w-3.5" />
            Clear
          </button>
        </div>
      </div>
    </section>
  );
}

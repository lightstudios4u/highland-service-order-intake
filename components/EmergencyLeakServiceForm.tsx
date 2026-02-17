"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  INITIAL_FORM_DATA,
  MOCK_FORM_DATA,
  MOCK_LOOKUP_VALUES,
  validateEmergencyLeakServiceForm,
} from "@/helpers/emergencyLeakServiceForm";
import {
  lookupServiceIntake,
  submitServiceOrderRequest,
} from "@/helpers/serviceOrderApi";
import { buildServiceOrderRequestPayload } from "@/helpers/serviceOrderPayload";
import {
  BillingInfoPayload,
  ClientInfoPayload,
  IntakeFormData,
  LeakDetailsPayload,
  LeakingProperty,
  ServiceIntakeRequestPayload,
  ServiceOrderLookupResponse,
  ValidationErrors,
} from "@/types/emergencyLeakService";
import LeakingPropertySection from "@/components/emergencyLeakService/LeakingPropertySection";
import ContactInfoSection from "@/components/emergencyLeakService/ContactInfoSection";
import BillingInfoSection from "@/components/emergencyLeakService/BillingInfoSection";

type EmergencyLeakServiceFormProps = {
  className?: string;
};

const DRAFT_STORAGE_KEY = "emergency-leak-service-intake-draft-v1";

type EmergencyLeakServiceDraft = {
  formData: IntakeFormData;
  serviceOrderLookupValue: string;
  emailLookupValue: string;
};

export default function EmergencyLeakServiceForm({
  className,
}: EmergencyLeakServiceFormProps) {
  const [formData, setFormData] = useState<IntakeFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [serviceOrderLookupValue, setServiceOrderLookupValue] = useState("");
  const [emailLookupValue, setEmailLookupValue] = useState("");
  const [lookupResults, setLookupResults] =
    useState<ServiceOrderLookupResponse | null>(null);
  const [lookupMessage, setLookupMessage] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [submitRequestId, setSubmitRequestId] = useState("");
  const [submitSuccessMessage, setSubmitSuccessMessage] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">(
    "idle",
  );

  const activeProperty = useMemo(
    () => formData.leakingProperties[0],
    [formData.leakingProperties],
  );

  useEffect(() => {
    try {
      const rawDraft = window.localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!rawDraft) {
        return;
      }

      const parsedDraft = JSON.parse(
        rawDraft,
      ) as Partial<EmergencyLeakServiceDraft>;

      if (parsedDraft.formData) {
        const draftProperty = parsedDraft.formData.leakingProperties?.[0];

        setFormData({
          ...INITIAL_FORM_DATA,
          ...parsedDraft.formData,
          leakingProperties: [
            {
              ...INITIAL_FORM_DATA.leakingProperties[0],
              ...(draftProperty ?? {}),
            },
          ],
        });
      }

      if (typeof parsedDraft.serviceOrderLookupValue === "string") {
        setServiceOrderLookupValue(parsedDraft.serviceOrderLookupValue);
      }

      if (typeof parsedDraft.emailLookupValue === "string") {
        setEmailLookupValue(parsedDraft.emailLookupValue);
      }

      setLookupMessage("Restored saved draft.");
    } catch {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const draft: EmergencyLeakServiceDraft = {
      formData,
      serviceOrderLookupValue,
      emailLookupValue,
    };

    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  }, [emailLookupValue, formData, serviceOrderLookupValue]);

  function updateField<K extends keyof IntakeFormData>(
    field: K,
    value: IntakeFormData[K],
  ) {
    setFormData((current) => ({ ...current, [field]: value }));
  }

  function updatePropertyField<K extends keyof LeakingProperty>(
    field: K,
    value: LeakingProperty[K],
  ) {
    setFormData((current) => ({
      ...current,
      leakingProperties: [{ ...current.leakingProperties[0], [field]: value }],
    }));
  }

  function applyPrefillData(data: Partial<IntakeFormData>) {
    setFormData((current) => {
      const next: IntakeFormData = {
        ...current,
        ...data,
      };

      if (data.leakingProperties && data.leakingProperties.length > 0) {
        next.leakingProperties = [
          {
            ...current.leakingProperties[0],
            ...data.leakingProperties[0],
          },
        ];
      }

      return next;
    });
  }

  function applyClientSelection(client: ClientInfoPayload) {
    applyPrefillData({
      clientDynamoAccountId: client.DynamoAccountId ?? null,
      clientDynamoCountId: client.DynamoCountId ?? null,
      clientAccountName: client.AccountName,
      clientAccountContactName: client.AccountContactName,
      clientEmail: client.Email,
      clientPhone: client.Phone,
    });
  }

  function applyBillingSelection(billing: BillingInfoPayload) {
    applyPrefillData({
      billingDynamoId: billing.DynamoId ?? null,
      billingEntityBillToName: billing.EntityBillToName,
      billingBillToAddress: billing.BillToAddress,
      billingBillToAddress2: billing.BillToAddress2,
      billingBillToCity: billing.BillToCity,
      billingBillToZip: billing.BillToZip,
      billingBillToEmail: billing.BillToEmail,
    });
  }

  function applyLeakSelection(leak: LeakDetailsPayload) {
    applyPrefillData({
      leakingProperties: [
        {
          dynamoId: leak.DynamoId ?? null,
          jobNo: leak.JobNo ?? "",
          siteName: leak.SiteName,
          siteAddress: leak.SiteAddress,
          siteAddress2: leak.SiteAddress2,
          siteCity: leak.SiteCity,
          siteZip: leak.SiteZip,
          tenantBusinessName: leak.TenantBusinessName,
          tenantContactName: leak.TenantContactName,
          tenantContactPhone: leak.TenantContactPhone,
          tenantContactCell: leak.TenantContactCell,
          tenantContactEmail: leak.TenantContactEmail,
          hoursOfOperation: leak.HoursOfOperation,
          leakLocation: leak.LeakLocation,
          leakNear: leak.LeakNear,
          leakNearOther: leak.LeakNearOther,
          hasAccessCode: leak.HasAccessCode,
          accessCode: leak.AccessCode,
          isSaturdayAccessPermitted: leak.IsSaturdayAccessPermitted,
          isKeyRequired: leak.IsKeyRequired,
          isLadderRequired: leak.IsLadderRequired,
          roofPitch: leak.RoofPitch,
          comments: leak.Comments,
        },
      ],
    });
  }

  async function performLookup(payload: ServiceIntakeRequestPayload) {
    setIsLookingUp(true);
    setLookupMessage("");

    try {
      const result = await lookupServiceIntake(payload);
      setLookupResults(result);

      if (result.serviceOrders.length === 0) {
        setLookupMessage(result.message ?? "No matching records were found.");
      } else {
        setLookupMessage(
          result.message ??
            `Found ${result.serviceOrders.length} possible match${result.serviceOrders.length === 1 ? "" : "es"}.`,
        );
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Lookup request failed.";
      setLookupResults(null);
      setLookupMessage(message);
    } finally {
      setIsLookingUp(false);
    }
  }

  async function handleLookupByServiceOrder() {
    await performLookup({
      JobNo: serviceOrderLookupValue.trim(),
      EmailAddress: "",
      City: activeProperty.siteCity.trim(),
      Zip: activeProperty.siteZip.trim(),
    });
  }

  async function handleLookupByEmail() {
    await performLookup({
      JobNo: "",
      EmailAddress: emailLookupValue.trim(),
      City: activeProperty.siteCity.trim(),
      Zip: activeProperty.siteZip.trim(),
    });
  }

  async function confirmSubmit() {
    setIsSubmitting(true);

    try {
      const payload = buildServiceOrderRequestPayload(formData);
      const submitResult = await submitServiceOrderRequest(payload);

      setSubmitState("success");
      setSubmitRequestId(submitResult.requestId);
      setSubmitSuccessMessage(submitResult.message);
      setIsConfirmModalOpen(false);
      setIsSuccessModalOpen(true);
      setFormData(INITIAL_FORM_DATA);
      setErrors({});
      setLookupResults(null);
      setLookupMessage("");
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      setSubmitState("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState("idle");

    const validation = validateEmergencyLeakServiceForm(formData);
    setErrors(validation);

    if (Object.keys(validation).length > 0) {
      return;
    }

    setIsConfirmModalOpen(true);
  }

  function prefillMockData() {
    setFormData(MOCK_FORM_DATA);
    setServiceOrderLookupValue(MOCK_LOOKUP_VALUES.serviceOrderNumber);
    setEmailLookupValue(MOCK_LOOKUP_VALUES.email);
    setErrors({});
    setLookupResults(null);
    setLookupMessage("Mock data loaded.");
    setSubmitState("idle");
    setIsConfirmModalOpen(false);
    setIsSuccessModalOpen(false);
  }

  function clearForm() {
    setFormData(INITIAL_FORM_DATA);
    setServiceOrderLookupValue("");
    setEmailLookupValue("");
    setErrors({});
    setLookupResults(null);
    setLookupMessage("Form cleared.");
    setSubmitState("idle");
    setIsConfirmModalOpen(false);
    setIsSuccessModalOpen(false);
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
  }

  return (
    <form
      className={className ?? "space-y-8 px-6 py-8 md:px-10"}
      onSubmit={onSubmit}
      noValidate
    >
      <section className="grid grid-cols-1 gap-5 rounded-lg border border-slate-300 p-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <h2 className="text-lg font-bold text-slate-900">
            Save Time — Prefill Your Info
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Submitted a service request before? Enter your previous service
            order number or the email on file and we&apos;ll pull in your
            account, billing, and property details so you don&apos;t have to
            re-enter them. You can also skip this step and fill everything out
            manually below.
          </p>
        </div>

        <label
          className="flex flex-col gap-2 text-sm font-semibold text-slate-800"
          htmlFor="lookupServiceOrderNumber"
        >
          Previous Service Order Number
          <input
            id="lookupServiceOrderNumber"
            name="lookupServiceOrderNumber"
            value={serviceOrderLookupValue}
            onChange={(event) => setServiceOrderLookupValue(event.target.value)}
            placeholder="e.g. ELS-26-01-4837 or reference ID"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
          />
          <button
            type="button"
            onClick={handleLookupByServiceOrder}
            disabled={isLookingUp || !serviceOrderLookupValue.trim()}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-md border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLookingUp && (
              <svg
                className="h-4 w-4 animate-spin text-emerald-600"
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
            {isLookingUp ? "Searching…" : "Look Up by Service Order"}
          </button>
        </label>

        <label
          className="flex flex-col gap-2 text-sm font-semibold text-slate-800"
          htmlFor="lookupEmail"
        >
          Email on File
          <input
            id="lookupEmail"
            name="lookupEmail"
            value={emailLookupValue}
            onChange={(event) => setEmailLookupValue(event.target.value)}
            type="email"
            placeholder="e.g. john@company.com"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
          />
          <button
            type="button"
            onClick={handleLookupByEmail}
            disabled={isLookingUp || !emailLookupValue.trim()}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-md border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLookingUp && (
              <svg
                className="h-4 w-4 animate-spin text-emerald-600"
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
            {isLookingUp ? "Searching…" : "Look Up by Email"}
          </button>
        </label>

        {lookupMessage ? (
          <p className="md:col-span-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            {lookupMessage}
          </p>
        ) : null}

        {lookupResults ? (
          <div className="md:col-span-2 grid grid-cols-1 gap-4">
            {lookupResults.clients.map((client, index) => (
              <div
                key={`client-${index}`}
                className="rounded-md border border-slate-200 p-3"
              >
                <p className="text-sm font-semibold text-slate-900">
                  Contact: {client.AccountName}
                </p>
                <p className="text-xs text-slate-600">
                  {client.AccountContactName} · {client.Email}
                </p>
                <button
                  type="button"
                  onClick={() => applyClientSelection(client)}
                  className="mt-2 inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Prefill Contact
                </button>
              </div>
            ))}

            {(() => {
              const billings = lookupResults.billings;
              if (billings.length === 0) return null;
              const merged: BillingInfoPayload =
                billings.length === 1
                  ? billings[0]
                  : billings.reduce<BillingInfoPayload>(
                      (acc, b) => ({
                        DynamoId: acc.DynamoId ?? b.DynamoId,
                        EntityBillToName:
                          acc.EntityBillToName || b.EntityBillToName,
                        BillToAddress: acc.BillToAddress || b.BillToAddress,
                        BillToAddress2: acc.BillToAddress2 || b.BillToAddress2,
                        BillToCity: acc.BillToCity || b.BillToCity,
                        BillToZip: acc.BillToZip || b.BillToZip,
                        BillToEmail: acc.BillToEmail || b.BillToEmail,
                      }),
                      {} as BillingInfoPayload,
                    );
              return (
                <div className="rounded-md border border-slate-200 p-3">
                  <p className="text-sm font-semibold text-slate-900">
                    Billing: {merged.EntityBillToName}
                  </p>
                  <p className="text-xs text-slate-600">
                    {merged.BillToAddress} {merged.BillToCity}
                  </p>
                  <button
                    type="button"
                    onClick={() => applyBillingSelection(merged)}
                    className="mt-2 inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    Prefill Billing
                  </button>
                </div>
              );
            })()}

            {lookupResults.leaks.map((leak, index) => (
              <div
                key={`leak-${index}`}
                className="rounded-md border border-slate-200 p-3"
              >
                <p className="text-sm font-semibold text-slate-900">
                  Property: {leak.SiteName}
                </p>
                <p className="text-xs text-slate-600">
                  {leak.SiteAddress}, {leak.SiteCity}
                </p>
                <button
                  type="button"
                  onClick={() => applyLeakSelection(leak)}
                  className="mt-2 inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Prefill Property
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <ContactInfoSection
        formData={formData}
        errors={errors}
        onFieldChange={updateField}
      />

      <BillingInfoSection
        formData={formData}
        errors={errors}
        onFieldChange={updateField}
      />

      <LeakingPropertySection
        property={activeProperty}
        errors={errors}
        onPropertyChange={updatePropertyField}
      />

      <div className="-mt-4">
        <button
          type="button"
          className="inline-flex items-center justify-center border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
        >
          Add Property
        </button>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-300 pt-6 md:flex-row md:justify-end">
        <button
          type="button"
          onClick={clearForm}
          className="inline-flex items-center justify-center rounded-md border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Clear Form
        </button>
        <button
          type="button"
          onClick={prefillMockData}
          className="inline-flex items-center justify-center rounded-md border border-emerald-600 px-6 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
        >
          Prefill Mock Data
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </button>
      </div>

      {isConfirmModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <p className="text-base font-bold text-slate-900">
              Confirm Submission
            </p>
            <p className="mt-3 text-sm text-slate-700">
              Are you sure information is correct and you want to submit this
              emergency leak inspection form?
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Submitting..." : "Yes, Submit"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isSuccessModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4">
          <div className="w-full max-w-md rounded-xl border border-emerald-200 bg-emerald-50 p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <Image
                src="/New-Logo-Final-White-1.svg"
                alt="Highland Commercial Roofing"
                width={140}
                height={28}
                className="rounded bg-emerald-700 px-2 py-1"
              />
              <p className="text-base font-bold text-emerald-800">
                Request Submitted
              </p>
            </div>
            <p className="mt-4 text-sm text-emerald-900">
              {submitSuccessMessage ||
                "Your emergency service request was submitted successfully."}
            </p>
            <p className="mt-3 rounded-md border border-emerald-300 bg-white px-3 py-2 text-sm text-emerald-900">
              Reference ID:{" "}
              <span className="font-bold">{submitRequestId || "Pending"}</span>
            </p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setIsSuccessModalOpen(false)}
                className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {submitState === "error" ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          Submission failed. Connect your backend endpoint and try again.
        </p>
      ) : null}
    </form>
  );
}

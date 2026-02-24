"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { LuFileWarning } from "react-icons/lu";

import {
  EMPTY_PROPERTY,
  INITIAL_FORM_DATA,
  MOCK_FORM_DATA,
  MOCK_LOOKUP_VALUES,
  isFormDirty,
  validateEmergencyLeakServiceForm,
  validateProperty,
  isPropertyDirty,
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
import IntakeHeader from "@/components/emergencyLeakService/IntakeHeader";
import OrderStatusPanel from "@/components/emergencyLeakService/OrderStatusPanel";
import SignatureSection from "@/components/emergencyLeakService/SignatureSection";

// Reverse maps: API returns 0-based numeric enum values → form string names
const LEAK_LOCATION_REVERSE: Record<number, LeakingProperty["leakLocation"]> = {
  0: "Front",
  1: "Middle",
  2: "Back",
};

const LEAK_NEAR_REVERSE: Record<number, LeakingProperty["leakNear"]> = {
  0: "HVACDuct",
  1: "Skylight",
  2: "Wall",
  3: "Drain",
  4: "Other",
};

const ROOF_PITCH_REVERSE: Record<number, LeakingProperty["roofPitch"]> = {
  0: "FlatRoof",
  1: "SteepShingleTile",
};

const DRAFT_STORAGE_KEY = "emergency-leak-service-intake-draft-v1";

type EmergencyLeakServiceDraft = {
  formData: IntakeFormData;
  serviceOrderLookupValue: string;
  emailLookupValue: string;
};

export default function EmergencyLeakServiceForm() {
  const [formData, setFormData] = useState<IntakeFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [serviceOrderLookupValue, setServiceOrderLookupValue] = useState("");
  const [emailLookupValue, setEmailLookupValue] = useState("");
  const [lookupResults, setLookupResults] =
    useState<ServiceOrderLookupResponse | null>(null);
  const [lookupMessage, setLookupMessage] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  // const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [submitRequestId, setSubmitRequestId] = useState("");
  const [submitSuccessMessage, setSubmitSuccessMessage] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [activeReferenceId, setActiveReferenceId] = useState("");
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // ── Property editor state ──
  const [editorProperty, setEditorProperty] = useState<LeakingProperty>({
    ...EMPTY_PROPERTY,
  });
  const [editingPropertyIndex, setEditingPropertyIndex] = useState<
    number | null
  >(null);
  const [editorErrors, setEditorErrors] = useState<ValidationErrors>({});
  const [isUpdatePropertyModalOpen, setIsUpdatePropertyModalOpen] =
    useState(false);
  const [isDeletePropertyModalOpen, setIsDeletePropertyModalOpen] =
    useState(false);
  const [deletePropertyIndex, setDeletePropertyIndex] = useState<number | null>(
    null,
  );
  const [signatureDataUrl, setSignatureDataUrl] = useState("");
  const [signatureName, setSignatureName] = useState("");
  const [billingTermsAcknowledged, setBillingTermsAcknowledged] =
    useState(false);

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
        const draftProperties =
          parsedDraft.formData.leakingProperties?.map((p) => ({
            ...EMPTY_PROPERTY,
            ...(p ?? {}),
          })) ?? [];

        setFormData({
          ...INITIAL_FORM_DATA,
          ...parsedDraft.formData,
          leakingProperties: draftProperties.length > 0 ? draftProperties : [],
        });
      }

      if (typeof parsedDraft.serviceOrderLookupValue === "string") {
        setServiceOrderLookupValue(parsedDraft.serviceOrderLookupValue);
      }

      if (typeof parsedDraft.emailLookupValue === "string") {
        setEmailLookupValue(parsedDraft.emailLookupValue);
      }

      // Draft restored silently
    } catch {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (lookupMessage === "Form cleared.") {
      const timer = setTimeout(() => setLookupMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [lookupMessage]);

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
    if (field === "clientAccountContactName") {
      setSignatureName(value as string);
    }
  }

  function updateEditorField<K extends keyof LeakingProperty>(
    field: K,
    value: LeakingProperty[K],
  ) {
    setEditorProperty((current) => ({ ...current, [field]: value }));
    // Clear editor-level error for this field when user types
    setEditorErrors((prev) => {
      if (!prev[field as keyof ValidationErrors]) return prev;
      const next = { ...prev };
      delete next[field as keyof ValidationErrors];
      return next;
    });
  }

  function applyPrefillData(data: Partial<IntakeFormData>) {
    setFormData((current) => {
      const next: IntakeFormData = {
        ...current,
        ...data,
      };

      // Keep existing properties array — prefill only touches top-level & billing/client
      if (data.leakingProperties) {
        next.leakingProperties = data.leakingProperties;
      } else {
        next.leakingProperties = current.leakingProperties;
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
    if (!signatureName.trim()) {
      setSignatureName(client.AccountContactName || "");
    }
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
    // Populate the editor form with the selected prefill data for review
    // Coerce nulls to empty strings so controlled inputs stay controlled
    setEditorProperty({
      dynamoId: leak.DynamoId ?? null,
      jobNo: leak.JobNo ?? "",
      siteName: leak.SiteName ?? "",
      siteAddress: leak.SiteAddress ?? "",
      siteAddress2: leak.SiteAddress2 ?? "",
      siteCity: leak.SiteCity ?? "",
      siteZip: leak.SiteZip ?? "",
      tenantBusinessName: leak.TenantBusinessName ?? "",
      tenantContactName: leak.TenantContactName ?? "",
      tenantContactPhone: leak.TenantContactPhone ?? "",
      tenantContactCell: leak.TenantContactCell ?? "",
      tenantContactEmail: leak.TenantContactEmail ?? "",
      hoursOfOperation: leak.HoursOfOperation ?? "",
      leakLocation:
        LEAK_LOCATION_REVERSE[leak.LeakLocation as unknown as number] ??
        leak.LeakLocation ??
        "",
      leakNear:
        LEAK_NEAR_REVERSE[leak.LeakNear as unknown as number] ??
        leak.LeakNear ??
        "",
      leakNearOther: leak.LeakNearOther ?? "",
      hasAccessCode: leak.HasAccessCode ?? false,
      accessCode: leak.AccessCode ?? "",
      isSaturdayAccessPermitted: leak.IsSaturdayAccessPermitted ?? false,
      isKeyRequired: leak.IsKeyRequired ?? false,
      isLadderRequired: leak.IsLadderRequired ?? false,
      roofPitch:
        ROOF_PITCH_REVERSE[leak.RoofPitch as unknown as number] ??
        leak.RoofPitch ??
        "",
      comments: leak.Comments ?? "",
    });
    setEditorErrors({});
    // Stay in whatever mode (add new or editing existing)
  }

  // ── Property array operations ──

  function handleAddOrUpdateProperty() {
    const propErrors = validateProperty(editorProperty);
    if (Object.keys(propErrors).length > 0) {
      setEditorErrors(propErrors);
      return;
    }
    setEditorErrors({});

    setFormData((current) => {
      const updated = [...current.leakingProperties];
      if (editingPropertyIndex !== null) {
        updated[editingPropertyIndex] = { ...editorProperty };
      } else {
        updated.push({ ...editorProperty });
      }
      return { ...current, leakingProperties: updated };
    });

    // Reset editor to blank "add new" mode
    setEditorProperty({ ...EMPTY_PROPERTY });
    setEditingPropertyIndex(null);
  }

  function handleEditProperty(index: number) {
    setEditorProperty({ ...formData.leakingProperties[index] });
    setEditingPropertyIndex(index);
    setEditorErrors({});
  }

  function handleCancelEdit() {
    // If nothing changed, silently close without prompting
    if (editingPropertyIndex !== null) {
      const original = formData.leakingProperties[editingPropertyIndex];
      const hasChanges = (
        Object.keys(original) as (keyof LeakingProperty)[]
      ).some((key) => editorProperty[key] !== original[key]);
      if (!hasChanges) {
        setEditorProperty({ ...EMPTY_PROPERTY });
        setEditingPropertyIndex(null);
        setEditorErrors({});
        return;
      }
    }
    // Open inline modal to ask whether to save changes
    setIsUpdatePropertyModalOpen(true);
  }

  function confirmUpdateProperty() {
    // Attempt to save; if validation fails, stay in edit mode
    const propErrors = validateProperty(editorProperty);
    if (Object.keys(propErrors).length > 0) {
      setEditorErrors(propErrors);
      setIsUpdatePropertyModalOpen(false);
      return;
    }
    setFormData((current) => {
      const updated = [...current.leakingProperties];
      if (editingPropertyIndex !== null) {
        updated[editingPropertyIndex] = { ...editorProperty };
      }
      return { ...current, leakingProperties: updated };
    });
    setEditorProperty({ ...EMPTY_PROPERTY });
    setEditingPropertyIndex(null);
    setEditorErrors({});
    setIsUpdatePropertyModalOpen(false);
  }

  function discardUpdateProperty() {
    setEditorProperty({ ...EMPTY_PROPERTY });
    setEditingPropertyIndex(null);
    setEditorErrors({});
    setIsUpdatePropertyModalOpen(false);
  }

  function handleCopyProperty(index: number) {
    setFormData((current) => {
      const copy = {
        ...current.leakingProperties[index],
        dynamoId: null,
        jobNo: "",
      };
      return {
        ...current,
        leakingProperties: [...current.leakingProperties, copy],
      };
    });
  }

  function handleDeleteProperty(index: number) {
    setDeletePropertyIndex(index);
    setIsDeletePropertyModalOpen(true);
  }

  function confirmDeleteProperty() {
    if (deletePropertyIndex === null) return;
    const index = deletePropertyIndex;
    setFormData((current) => {
      const updated = current.leakingProperties.filter((_, i) => i !== index);
      return { ...current, leakingProperties: updated };
    });
    // If we were editing the deleted row, reset editor
    if (editingPropertyIndex === index) {
      setEditorProperty({ ...EMPTY_PROPERTY });
      setEditingPropertyIndex(null);
      setEditorErrors({});
    } else if (editingPropertyIndex !== null && editingPropertyIndex > index) {
      // Adjust index if a row before it was removed
      setEditingPropertyIndex(editingPropertyIndex - 1);
    }
    setDeletePropertyIndex(null);
    setIsDeletePropertyModalOpen(false);
  }

  function cancelDeleteProperty() {
    setDeletePropertyIndex(null);
    setIsDeletePropertyModalOpen(false);
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
    const firstProp = formData.leakingProperties[0];
    await performLookup({
      JobNo: serviceOrderLookupValue.trim(),
      EmailAddress: "",
      City: firstProp?.siteCity.trim() ?? "",
      Zip: firstProp?.siteZip.trim() ?? "",
    });
    setServiceOrderLookupValue("");
    setEmailLookupValue("");
  }

  async function handleLookupByEmail() {
    const firstProp = formData.leakingProperties[0];
    await performLookup({
      JobNo: "",
      EmailAddress: emailLookupValue.trim(),
      City: firstProp?.siteCity.trim() ?? "",
      Zip: firstProp?.siteZip.trim() ?? "",
    });
    setServiceOrderLookupValue("");
    setEmailLookupValue("");
  }

  async function confirmSubmit() {
    setIsSubmitting(true);

    try {
      const payload = buildServiceOrderRequestPayload(
        formData,
        signatureDataUrl,
        signatureName,
      );
      const submitResult = await submitServiceOrderRequest(payload);

      setSubmitState("success");
      setSubmitRequestId(submitResult.requestId);
      setSubmitSuccessMessage(submitResult.message);
      setActiveReferenceId(submitResult.requestId);
      setIsConfirmModalOpen(false);
      setIsSuccessModalOpen(true);
      setFormData(INITIAL_FORM_DATA);
      setEditorProperty({ ...EMPTY_PROPERTY });
      setEditingPropertyIndex(null);
      setEditorErrors({});
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

    // Auto-add the editor property if the user filled it out but didn't click Add
    let submissionFormData = formData;
    if (isPropertyDirty(editorProperty)) {
      const propErrors = validateProperty(editorProperty);
      if (Object.keys(propErrors).length > 0) {
        setEditorErrors(propErrors);
        return;
      }
      const updated =
        editingPropertyIndex !== null
          ? formData.leakingProperties.map((p, i) =>
              i === editingPropertyIndex ? { ...editorProperty } : p,
            )
          : [...formData.leakingProperties, { ...editorProperty }];
      submissionFormData = { ...formData, leakingProperties: updated };
      setFormData(submissionFormData);
      setEditorProperty({ ...EMPTY_PROPERTY });
      setEditingPropertyIndex(null);
      setEditorErrors({});
    }

    const validation = validateEmergencyLeakServiceForm(submissionFormData);
    if (!signatureDataUrl) {
      validation.signature = "Signature is required.";
    }
    if (!signatureName.trim()) {
      validation.signatureName = "Name is required.";
    }
    if (!billingTermsAcknowledged) {
      validation.billingTermsAcknowledged =
        "You must acknowledge the billing terms.";
    }
    setErrors(validation);

    if (Object.keys(validation).length > 0) {
      return;
    }

    setIsConfirmModalOpen(true);
  }

  function prefillMockData() {
    // Load everything except properties into the form; table stays empty
    setFormData({ ...MOCK_FORM_DATA, leakingProperties: [] });
    setServiceOrderLookupValue(MOCK_LOOKUP_VALUES.serviceOrderNumber);
    setEmailLookupValue(MOCK_LOOKUP_VALUES.email);
    setErrors({});
    setEditorErrors({});
    // Pre-fill the editor so the user can review and click "Add Property"
    setEditorProperty({ ...MOCK_FORM_DATA.leakingProperties[0] });
    setEditingPropertyIndex(null);
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
    setEditorErrors({});
    setEditorProperty({ ...EMPTY_PROPERTY });
    setEditingPropertyIndex(null);
    setSignatureDataUrl("");
    setSignatureName("");
    setBillingTermsAcknowledged(false);
    setLookupResults(null);
    setLookupMessage("Form cleared.");
    setSubmitState("idle");
    setActiveReferenceId("");
    setIsConfirmModalOpen(false);
    setIsSuccessModalOpen(false);
    setIsResetModalOpen(false);
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
  }

  function handleResetClick() {
    if (isFormDirty(formData, serviceOrderLookupValue, emailLookupValue)) {
      setIsResetModalOpen(true);
    } else {
      clearForm();
    }
  }

  function handleStatusDismiss() {
    setActiveReferenceId("");
    setSubmitState("idle");
    setSubmitRequestId("");
    setSubmitSuccessMessage("");
    setIsSuccessModalOpen(false);
    setSignatureName("");
    setBillingTermsAcknowledged(false);
    setSignatureDataUrl("");
  }

  if (activeReferenceId && !isSuccessModalOpen) {
    return (
      <div>
        <IntakeHeader
          lookupValue={serviceOrderLookupValue || emailLookupValue}
          onLookupValueChange={(v) => {
            setServiceOrderLookupValue(v);
            setEmailLookupValue(v);
          }}
          onLookupByEmail={handleLookupByEmail}
          onLookupByServiceOrder={handleLookupByServiceOrder}
          isLookingUp={isLookingUp}
          lookupMessage={lookupMessage}
        />
        <div className="space-y-8 px-6 py-8 md:px-10">
          <OrderStatusPanel
            referenceId={activeReferenceId}
            onDismiss={handleStatusDismiss}
          />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <IntakeHeader
        onReset={handleResetClick}
        isResetDisabled={
          !isFormDirty(formData, serviceOrderLookupValue, emailLookupValue)
        }
        lookupValue={serviceOrderLookupValue || emailLookupValue}
        onLookupValueChange={(v) => {
          setServiceOrderLookupValue(v);
          setEmailLookupValue(v);
        }}
        onLookupByEmail={handleLookupByEmail}
        onLookupByServiceOrder={handleLookupByServiceOrder}
        isLookingUp={isLookingUp}
        lookupMessage={lookupMessage}
      />

      <div className="space-y-8 px-6 py-8 md:px-10">
        {/* Old collapsible lookup section — replaced by header inline lookup
        <section className="overflow-hidden rounded-lg border border-slate-300">
          <button
            type="button"
            onClick={() => setIsLookupOpen((prev) => !prev)}
            className="flex w-full items-center justify-between bg-[#1e2a3a] p-4 text-left"
          >
            <div>
              <h2 className="text-lg font-bold text-white">
                Save Time — Prefill Your Info
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-300">
                Look up a previous service order to auto-fill your details.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-xs font-medium text-slate-400">
                {isLookupOpen ? "Click to close" : "Click to open"}
              </span>
              <svg
                className={`h-5 w-5 text-white transition-transform ${
                  isLookupOpen ? "rotate-180" : ""
                }`}
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
            </div>
          </button>

          {isLookupOpen && (
            <div className="grid grid-cols-1 gap-5 border-t border-slate-200 p-4 md:grid-cols-2">
              <label
                className="flex flex-col gap-2 text-sm font-semibold text-slate-800"
                htmlFor="lookupServiceOrderNumber"
              >
                Previous Service Order Number
                <input
                  id="lookupServiceOrderNumber"
                  name="lookupServiceOrderNumber"
                  value={serviceOrderLookupValue}
                  onChange={(event) =>
                    setServiceOrderLookupValue(event.target.value)
                  }
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
            </div>
          )}
        </section>
        End of old lookup section */}

        <ContactInfoSection
          formData={formData}
          errors={errors}
          onFieldChange={updateField}
          prefillClients={lookupResults?.clients ?? []}
          onPrefillClient={applyClientSelection}
          onContactNameBlur={(name) => {
            setSignatureName(name);
          }}
        />

        <BillingInfoSection
          formData={formData}
          errors={errors}
          onFieldChange={updateField}
          prefillBillings={lookupResults?.billings ?? []}
          onPrefillBilling={applyBillingSelection}
        />

        <LeakingPropertySection
          properties={formData.leakingProperties}
          editingIndex={editingPropertyIndex}
          editorProperty={editorProperty}
          errors={editorErrors}
          onEditorChange={updateEditorField}
          onAddOrUpdate={handleAddOrUpdateProperty}
          onEditSelect={handleEditProperty}
          onCancelEdit={handleCancelEdit}
          onCopy={handleCopyProperty}
          onDelete={handleDeleteProperty}
          prefillLeaks={lookupResults?.leaks ?? []}
          onPrefillLeak={applyLeakSelection}
        />

        <SignatureSection
          value={signatureDataUrl}
          onChange={setSignatureDataUrl}
          error={errors.signature}
          signatureName={signatureName}
          onSignatureNameChange={setSignatureName}
          signatureNameError={errors.signatureName}
          billingTermsAcknowledged={billingTermsAcknowledged}
          onBillingTermsChange={(checked) => {
            setBillingTermsAcknowledged(checked);
            if (checked) {
              setErrors((prev) => {
                const next = { ...prev };
                delete next.billingTermsAcknowledged;
                return next;
              });
            }
          }}
          billingTermsError={errors.billingTermsAcknowledged}
        />

        {/* Show error when submit is attempted with no properties */}
        {errors.siteName === "At least one property is required." &&
          formData.leakingProperties.length === 0 && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {errors.siteName}
            </p>
          )}

        <div className="flex flex-col gap-3  md:flex-row md:justify-end">
          <button
            type="button"
            onClick={() => {
              window.localStorage.removeItem(DRAFT_STORAGE_KEY);
              clearForm();
            }}
            className="inline-flex items-center justify-center rounded-md border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Clear Local Storage
          </button>
          <button
            type="button"
            onClick={prefillMockData}
            className="inline-flex items-center justify-center rounded-md border border-[#2f9750] px-6 py-3 text-sm font-semibold text-[#2f9750] transition hover:bg-[#2f9750]/10"
          >
            Prefill Mock Data
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center rounded-md gap-2 bg-slate-700 px-6 py-4 text-2xl font-bold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <LuFileWarning className="text-3xl text-white" />

            {isSubmitting ? "Submitting..." : "SUBMIT REQUEST"}
          </button>
          {/* <button
            type="button"
            onClick={clearForm}
            className="inline-flex items-center justify-center rounded-md border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Clear Form
          </button> */}
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
                  className="inline-flex items-center justify-center rounded-md bg-[#2f9750] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#268a45] disabled:cursor-not-allowed disabled:opacity-70"
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
                <span className="font-bold">
                  {submitRequestId || "Pending"}
                </span>
              </p>
              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSuccessModalOpen(false)}
                  className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  View Order Status
                </button>
                <button
                  type="button"
                  onClick={handleStatusDismiss}
                  className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Submit Another
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {isDeletePropertyModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
              <p className="text-base font-bold text-slate-900">
                Delete Property?
              </p>
              <p className="mt-3 text-sm text-slate-700">
                Are you sure you want to delete this property? This action
                cannot be undone.
              </p>
              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={cancelDeleteProperty}
                  className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteProperty}
                  className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {isUpdatePropertyModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
              <p className="text-base font-bold text-slate-900">
                Update Property?
              </p>
              <p className="mt-3 text-sm text-slate-700">
                Do you want to save your changes to this property before closing
                the editor?
              </p>
              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={discardUpdateProperty}
                  className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Discard Changes
                </button>
                <button
                  type="button"
                  onClick={confirmUpdateProperty}
                  className="inline-flex items-center justify-center rounded-md bg-[#2f9750] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#268a45]"
                >
                  Yes, Update
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {isResetModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
              <p className="text-base font-bold text-slate-900">Reset Form?</p>
              <p className="mt-3 text-sm text-slate-700">
                You have entered data on this form. Are you sure you want to
                reset all fields and clear all filters? This action cannot be
                undone.
              </p>
              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={clearForm}
                  className="inline-flex items-center justify-center rounded-md bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Yes, Reset Everything
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
      </div>
    </form>
  );
}

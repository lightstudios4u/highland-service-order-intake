import { ChangeEvent, useMemo, useState } from "react";
import {
  BillingInfoPayload,
  IntakeFormData,
  ValidationErrors,
} from "@/types/emergencyLeakService";
import { FormInput } from "@/components/emergencyLeakService/FormInput";
import PrefillDropdown, {
  PrefillOption,
} from "@/components/emergencyLeakService/PrefillDropdown";

type BillingInfoSectionProps = {
  formData: IntakeFormData;
  errors: ValidationErrors;
  onFieldChange: <K extends keyof IntakeFormData>(
    field: K,
    value: IntakeFormData[K],
  ) => void;
  prefillBillings: BillingInfoPayload[];
  onPrefillBilling: (billing: BillingInfoPayload) => void;
};

export default function BillingInfoSection({
  formData,
  errors,
  onFieldChange,
  prefillBillings,
  onPrefillBilling,
}: BillingInfoSectionProps) {
  const [previewData, setPreviewData] = useState<BillingInfoPayload | null>(
    null,
  );

  const isPreviewing = previewData !== null;

  const displayed = {
    billingEntityBillToName:
      previewData?.EntityBillToName ?? formData.billingEntityBillToName,
    billingBillToAddress:
      previewData?.BillToAddress ?? formData.billingBillToAddress,
    billingBillToAddress2:
      previewData?.BillToAddress2 ?? formData.billingBillToAddress2,
    billingBillToCity: previewData?.BillToCity ?? formData.billingBillToCity,
    billingBillToZip: previewData?.BillToZip ?? formData.billingBillToZip,
    billingBillToEmail: previewData?.BillToEmail ?? formData.billingBillToEmail,
  };

  const handleInput =
    <K extends keyof IntakeFormData>(field: K) =>
    (event: ChangeEvent<HTMLInputElement>) =>
      onFieldChange(field, event.target.value as IntakeFormData[K]);

  const options: PrefillOption<BillingInfoPayload>[] = useMemo(
    () =>
      prefillBillings.map((b) => ({
        label: b.EntityBillToName || "Unnamed Billing",
        description: `${b.BillToAddress} ${b.BillToCity}`.trim() || undefined,
        value: b,
      })),
    [prefillBillings],
  );

  return (
    <section className="overflow-hidden rounded-lg border border-slate-300">
      <div className="bg-slate-700 px-4 py-3">
        <h2 className="text-lg font-bold text-white">Billing Info</h2>
      </div>
      <div className="bg-white p-4">
        {options.length > 0 && (
          <div className="mb-5">
            <PrefillDropdown
              options={options}
              onSelect={onPrefillBilling}
              onPreview={setPreviewData}
              accentColor="green"
            />
          </div>
        )}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormInput
            id="billingEntityBillToName"
            label="Bill To Name"
            value={displayed.billingEntityBillToName}
            onChange={handleInput("billingEntityBillToName")}
            error={errors.billingEntityBillToName}
            previewing={isPreviewing}
          />
          <FormInput
            id="billingBillToAddress"
            label="Bill To Address"
            value={displayed.billingBillToAddress}
            onChange={handleInput("billingBillToAddress")}
            error={errors.billingBillToAddress}
            previewing={isPreviewing}
          />
          <FormInput
            id="billingBillToAddress2"
            label="Bill To Address 2"
            value={displayed.billingBillToAddress2}
            onChange={handleInput("billingBillToAddress2")}
            error={errors.billingBillToAddress2}
            previewing={isPreviewing}
          />
          <FormInput
            id="billingBillToCity"
            label="Bill To City"
            value={displayed.billingBillToCity}
            onChange={handleInput("billingBillToCity")}
            error={errors.billingBillToCity}
            previewing={isPreviewing}
          />
          <FormInput
            id="billingBillToZip"
            label="Bill To Zip"
            value={displayed.billingBillToZip}
            onChange={handleInput("billingBillToZip")}
            error={errors.billingBillToZip}
            previewing={isPreviewing}
          />
          <FormInput
            id="billingBillToEmail"
            label="Bill To Email"
            value={displayed.billingBillToEmail}
            onChange={handleInput("billingBillToEmail")}
            error={errors.billingBillToEmail}
            previewing={isPreviewing}
            type="email"
          />
        </div>
      </div>
    </section>
  );
}

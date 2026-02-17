import { ChangeEvent } from "react";
import { IntakeFormData, ValidationErrors } from "@/types/emergencyLeakService";
import { FormInput } from "@/components/emergencyLeakService/FormInput";

type BillingInfoSectionProps = {
  formData: IntakeFormData;
  errors: ValidationErrors;
  onFieldChange: <K extends keyof IntakeFormData>(
    field: K,
    value: IntakeFormData[K],
  ) => void;
};

export default function BillingInfoSection({
  formData,
  errors,
  onFieldChange,
}: BillingInfoSectionProps) {
  const handleInput =
    <K extends keyof IntakeFormData>(field: K) =>
    (event: ChangeEvent<HTMLInputElement>) =>
      onFieldChange(field, event.target.value as IntakeFormData[K]);

  return (
    <section className="grid grid-cols-1 gap-5 rounded-lg border border-slate-300 p-4 md:grid-cols-2">
      <h2 className="md:col-span-2 text-lg font-bold text-slate-900">
        Billing Info
      </h2>
      <FormInput
        id="billingEntityBillToName"
        label="Bill To Name"
        value={formData.billingEntityBillToName}
        onChange={handleInput("billingEntityBillToName")}
        error={errors.billingEntityBillToName}
      />
      <FormInput
        id="billingBillToAddress"
        label="Bill To Address"
        value={formData.billingBillToAddress}
        onChange={handleInput("billingBillToAddress")}
        error={errors.billingBillToAddress}
      />
      <FormInput
        id="billingBillToAddress2"
        label="Bill To Address 2"
        value={formData.billingBillToAddress2}
        onChange={handleInput("billingBillToAddress2")}
        error={errors.billingBillToAddress2}
      />
      <FormInput
        id="billingBillToCity"
        label="Bill To City"
        value={formData.billingBillToCity}
        onChange={handleInput("billingBillToCity")}
        error={errors.billingBillToCity}
      />
      <FormInput
        id="billingBillToZip"
        label="Bill To Zip"
        value={formData.billingBillToZip}
        onChange={handleInput("billingBillToZip")}
        error={errors.billingBillToZip}
      />
      <FormInput
        id="billingBillToEmail"
        label="Bill To Email"
        value={formData.billingBillToEmail}
        onChange={handleInput("billingBillToEmail")}
        error={errors.billingBillToEmail}
        type="email"
      />
    </section>
  );
}

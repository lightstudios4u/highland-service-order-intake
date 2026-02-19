import { ChangeEvent, useMemo, useState } from "react";
import {
  ClientInfoPayload,
  IntakeFormData,
  ValidationErrors,
} from "@/types/emergencyLeakService";
import { FormInput } from "@/components/emergencyLeakService/FormInput";
import PrefillDropdown, {
  PrefillOption,
} from "@/components/emergencyLeakService/PrefillDropdown";

type ContactInfoSectionProps = {
  formData: IntakeFormData;
  errors: ValidationErrors;
  onFieldChange: <K extends keyof IntakeFormData>(
    field: K,
    value: IntakeFormData[K],
  ) => void;
  prefillClients: ClientInfoPayload[];
  onPrefillClient: (client: ClientInfoPayload) => void;
};

export default function ContactInfoSection({
  formData,
  errors,
  onFieldChange,
  prefillClients,
  onPrefillClient,
}: ContactInfoSectionProps) {
  const [previewData, setPreviewData] = useState<ClientInfoPayload | null>(
    null,
  );

  const isPreviewing = previewData !== null;

  const displayed = {
    clientAccountName: previewData?.AccountName ?? formData.clientAccountName,
    clientAccountContactName:
      previewData?.AccountContactName ?? formData.clientAccountContactName,
    clientPhone: previewData?.Phone ?? formData.clientPhone,
    clientEmail: previewData?.Email ?? formData.clientEmail,
  };

  const handleInput =
    <K extends keyof IntakeFormData>(field: K) =>
    (event: ChangeEvent<HTMLInputElement>) =>
      onFieldChange(field, event.target.value as IntakeFormData[K]);

  const options: PrefillOption<ClientInfoPayload>[] = useMemo(
    () =>
      prefillClients.map((c) => ({
        label: c.AccountName || "Unnamed Account",
        description: `${c.AccountContactName} · ${c.Email}`,
        value: c,
      })),
    [prefillClients],
  );

  return (
    <section className="overflow-hidden rounded-lg border border-slate-300">
      <div className="bg-slate-700 px-4 py-3">
        <h2 className="text-lg font-bold text-white">Account Info</h2>
      </div>
      <div className="bg-white p-4">
        {options.length > 0 && (
          <div className="mb-5">
            <PrefillDropdown
              options={options}
              onSelect={onPrefillClient}
              onPreview={setPreviewData}
              accentColor="green"
            />
          </div>
        )}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormInput
            id="clientAccountName"
            label="Account Name*"
            value={displayed.clientAccountName}
            onChange={handleInput("clientAccountName")}
            error={errors.clientAccountName}
            previewing={isPreviewing}
          />
          <FormInput
            id="clientAccountContactName"
            label="Account Contact Name*"
            value={displayed.clientAccountContactName}
            onChange={handleInput("clientAccountContactName")}
            error={errors.clientAccountContactName}
            previewing={isPreviewing}
          />
          <FormInput
            id="clientPhone"
            label="Phone Number*"
            value={displayed.clientPhone}
            onChange={handleInput("clientPhone")}
            error={errors.clientPhone}
            type="tel"
            placeholder="(555) 123-4567"
            previewing={isPreviewing}
          />
          <FormInput
            id="clientEmail"
            label="Email Address*"
            value={displayed.clientEmail}
            onChange={handleInput("clientEmail")}
            error={errors.clientEmail}
            previewing={isPreviewing}
            type="email"
          />
        </div>
      </div>
    </section>
  );
}

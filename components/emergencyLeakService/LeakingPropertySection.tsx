import { ChangeEvent, useMemo, useState } from "react";
import {
  LeakDetailsPayload,
  LeakingProperty,
  ValidationErrors,
} from "@/types/emergencyLeakService";
import {
  FormInput,
  FormTextarea,
} from "@/components/emergencyLeakService/FormInput";
import PrefillDropdown, {
  PrefillOption,
} from "@/components/emergencyLeakService/PrefillDropdown";

type LeakingPropertySectionProps = {
  property: LeakingProperty;
  errors: ValidationErrors;
  onPropertyChange: <K extends keyof LeakingProperty>(
    field: K,
    value: LeakingProperty[K],
  ) => void;
  prefillLeaks: LeakDetailsPayload[];
  onPrefillLeak: (leak: LeakDetailsPayload) => void;
};

export default function LeakingPropertySection({
  property,
  errors,
  onPropertyChange,
  prefillLeaks,
  onPrefillLeak,
}: LeakingPropertySectionProps) {
  const [previewData, setPreviewData] = useState<LeakDetailsPayload | null>(
    null,
  );

  const isPreviewing = previewData !== null;

  const displayed = {
    siteName: previewData?.SiteName ?? property.siteName,
    siteAddress: previewData?.SiteAddress ?? property.siteAddress,
    siteAddress2: previewData?.SiteAddress2 ?? property.siteAddress2,
    siteCity: previewData?.SiteCity ?? property.siteCity,
    siteZip: previewData?.SiteZip ?? property.siteZip,
    tenantBusinessName:
      previewData?.TenantBusinessName ?? property.tenantBusinessName,
    tenantContactName:
      previewData?.TenantContactName ?? property.tenantContactName,
    tenantContactPhone:
      previewData?.TenantContactPhone ?? property.tenantContactPhone,
    tenantContactCell:
      previewData?.TenantContactCell ?? property.tenantContactCell,
    tenantContactEmail:
      previewData?.TenantContactEmail ?? property.tenantContactEmail,
    hoursOfOperation:
      previewData?.HoursOfOperation ?? property.hoursOfOperation,
    leakNearOther: previewData?.LeakNearOther ?? property.leakNearOther,
    accessCode: previewData?.AccessCode ?? property.accessCode,
    comments: previewData?.Comments ?? property.comments,
    leakLocation: previewData?.LeakLocation ?? property.leakLocation,
    leakNear: previewData?.LeakNear ?? property.leakNear,
    roofPitch: previewData?.RoofPitch ?? property.roofPitch,
    hasAccessCode: previewData?.HasAccessCode ?? property.hasAccessCode,
    isSaturdayAccessPermitted:
      previewData?.IsSaturdayAccessPermitted ??
      property.isSaturdayAccessPermitted,
    isKeyRequired: previewData?.IsKeyRequired ?? property.isKeyRequired,
    isLadderRequired:
      previewData?.IsLadderRequired ?? property.isLadderRequired,
  };

  const handleInput =
    <K extends keyof LeakingProperty>(field: K) =>
    (event: ChangeEvent<HTMLInputElement>) =>
      onPropertyChange(field, event.target.value as LeakingProperty[K]);

  const options: PrefillOption<LeakDetailsPayload>[] = useMemo(
    () =>
      prefillLeaks.map((l) => ({
        label: l.SiteName || "Unnamed Property",
        description: `${l.SiteAddress}, ${l.SiteCity}`.trim() || undefined,
        value: l,
      })),
    [prefillLeaks],
  );

  const previewInputClass = isPreviewing
    ? "border-amber-300 bg-amber-50"
    : "border-slate-300 bg-white";

  return (
    <section className="overflow-hidden rounded-lg border border-slate-300">
      <div className="bg-slate-700 px-4 py-3">
        <h2 className="text-lg font-bold text-white">Property Info</h2>
      </div>
      <div className="bg-white p-4">
        {options.length > 0 && (
          <div className="mb-5">
            <PrefillDropdown
              options={options}
              onSelect={onPrefillLeak}
              onPreview={setPreviewData}
              accentColor="green"
            />
          </div>
        )}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormInput
            id="siteName"
            label="Site Name*"
            value={displayed.siteName}
            onChange={handleInput("siteName")}
            error={errors.siteName}
            previewing={isPreviewing}
          />
          <FormInput
            id="siteAddress"
            label="Site Address*"
            value={displayed.siteAddress}
            onChange={handleInput("siteAddress")}
            error={errors.siteAddress}
            previewing={isPreviewing}
          />
          <FormInput
            id="siteAddress2"
            label="Site Address 2"
            value={displayed.siteAddress2}
            onChange={handleInput("siteAddress2")}
            error={errors.siteAddress2}
            previewing={isPreviewing}
          />
          <FormInput
            id="siteCity"
            label="Site City*"
            value={displayed.siteCity}
            onChange={handleInput("siteCity")}
            error={errors.siteCity}
            previewing={isPreviewing}
          />
          <FormInput
            id="siteZip"
            label="Site Zip*"
            value={displayed.siteZip}
            onChange={handleInput("siteZip")}
            error={errors.siteZip}
            previewing={isPreviewing}
          />
          <FormInput
            id="tenantBusinessName"
            label="Tenant Business Name"
            value={displayed.tenantBusinessName}
            onChange={handleInput("tenantBusinessName")}
            error={errors.tenantBusinessName}
            previewing={isPreviewing}
          />
          <FormInput
            id="tenantContactName"
            label="Tenant Contact Name"
            value={displayed.tenantContactName}
            onChange={handleInput("tenantContactName")}
            error={errors.tenantContactName}
            previewing={isPreviewing}
          />
          <FormInput
            id="tenantContactPhone"
            label="Tenant Contact Phone"
            value={displayed.tenantContactPhone}
            onChange={handleInput("tenantContactPhone")}
            error={errors.tenantContactPhone}
            type="tel"
            placeholder="(555) 123-4567"
            previewing={isPreviewing}
          />
          <FormInput
            id="tenantContactCell"
            label="Tenant Contact Cell"
            value={displayed.tenantContactCell}
            onChange={handleInput("tenantContactCell")}
            error={errors.tenantContactCell}
            type="tel"
            placeholder="(555) 123-4567"
            previewing={isPreviewing}
          />
          <FormInput
            id="tenantContactEmail"
            label="Tenant Contact Email"
            value={displayed.tenantContactEmail}
            onChange={handleInput("tenantContactEmail")}
            error={errors.tenantContactEmail}
            previewing={isPreviewing}
            type="email"
          />
          <FormInput
            id="hoursOfOperation"
            label="Hours Of Operation"
            value={displayed.hoursOfOperation}
            onChange={handleInput("hoursOfOperation")}
            error={errors.hoursOfOperation}
            previewing={isPreviewing}
          />

          <label
            className="flex flex-col gap-2 text-sm font-semibold text-slate-800"
            htmlFor="leakLocation"
          >
            Leak Location
            <select
              id="leakLocation"
              name="leakLocation"
              value={displayed.leakLocation}
              onChange={(event) =>
                onPropertyChange(
                  "leakLocation",
                  event.target.value as LeakingProperty["leakLocation"],
                )
              }
              className={`w-full rounded-md border px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 ${previewInputClass}`}
            >
              <option value="Front">Front</option>
              <option value="Middle">Middle</option>
              <option value="Back">Back</option>
            </select>
          </label>

          <label
            className="flex flex-col gap-2 text-sm font-semibold text-slate-800"
            htmlFor="leakNear"
          >
            Leak Near
            <select
              id="leakNear"
              name="leakNear"
              value={displayed.leakNear}
              onChange={(event) =>
                onPropertyChange(
                  "leakNear",
                  event.target.value as LeakingProperty["leakNear"],
                )
              }
              className={`w-full rounded-md border px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 ${previewInputClass}`}
            >
              <option value="HVACDuct">HVAC Duct</option>
              <option value="Skylight">Skylight</option>
              <option value="Wall">Wall</option>
              <option value="Drain">Drain</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <FormInput
            id="leakNearOther"
            label="Leak Near Other"
            value={displayed.leakNearOther}
            onChange={handleInput("leakNearOther")}
            error={errors.leakNearOther}
            previewing={isPreviewing}
          />
          <label
            className="flex flex-col gap-2 text-sm font-semibold text-slate-800"
            htmlFor="roofPitch"
          >
            Roof Pitch
            <select
              id="roofPitch"
              name="roofPitch"
              value={displayed.roofPitch}
              onChange={(event) =>
                onPropertyChange(
                  "roofPitch",
                  event.target.value as LeakingProperty["roofPitch"],
                )
              }
              className={`w-full rounded-md border px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 ${previewInputClass}`}
            >
              <option value="FlatRoof">Flat Roof</option>
              <option value="SteepShingleTile">Steep Shingle/Tile</option>
            </select>
          </label>

          <div className="md:col-start-2">
            <div className="flex w-full flex-col gap-2 rounded-md border border-slate-200 p-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={displayed.hasAccessCode}
                  onChange={(event) =>
                    onPropertyChange("hasAccessCode", event.target.checked)
                  }
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                Has Access Code
              </label>

              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={displayed.isSaturdayAccessPermitted}
                  onChange={(event) =>
                    onPropertyChange(
                      "isSaturdayAccessPermitted",
                      event.target.checked,
                    )
                  }
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                Saturday Access Permitted
              </label>

              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={displayed.isKeyRequired}
                  onChange={(event) =>
                    onPropertyChange("isKeyRequired", event.target.checked)
                  }
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                Key Required
              </label>

              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={displayed.isLadderRequired}
                  onChange={(event) =>
                    onPropertyChange("isLadderRequired", event.target.checked)
                  }
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                Ladder Required
              </label>
            </div>
          </div>

          <div className="md:col-start-2">
            <FormInput
              id="accessCode"
              label="Access Code"
              value={displayed.accessCode}
              onChange={handleInput("accessCode")}
              error={errors.accessCode}
              previewing={isPreviewing}
            />
          </div>

          <FormTextarea
            id="comments"
            label="Comments"
            value={displayed.comments}
            onChange={(event) =>
              onPropertyChange("comments", event.target.value)
            }
            error={errors.comments}
            className="md:col-span-2 flex flex-col gap-2 text-sm font-semibold text-slate-800"
            previewing={isPreviewing}
          />
        </div>
      </div>
    </section>
  );
}

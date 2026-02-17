import { ChangeEvent } from "react";
import {
  LeakingProperty,
  ValidationErrors,
} from "@/types/emergencyLeakService";
import {
  FormInput,
  FormTextarea,
} from "@/components/emergencyLeakService/FormInput";

type LeakingPropertySectionProps = {
  property: LeakingProperty;
  errors: ValidationErrors;
  onPropertyChange: <K extends keyof LeakingProperty>(
    field: K,
    value: LeakingProperty[K],
  ) => void;
};

export default function LeakingPropertySection({
  property,
  errors,
  onPropertyChange,
}: LeakingPropertySectionProps) {
  const handleInput =
    <K extends keyof LeakingProperty>(field: K) =>
    (event: ChangeEvent<HTMLInputElement>) =>
      onPropertyChange(field, event.target.value as LeakingProperty[K]);

  return (
    <section className="rounded-lg border border-slate-300 bg-white">
      <div className="border-b border-slate-300 bg-slate-100 px-4 py-3">
        <h2 className="text-lg font-bold text-slate-900">Leaking Property 1</h2>
      </div>
      <div className="grid grid-cols-1 gap-5 p-4 md:grid-cols-2">
        <FormInput
          id="siteName"
          label="Site Name*"
          value={property.siteName}
          onChange={handleInput("siteName")}
          error={errors.siteName}
        />
        <FormInput
          id="siteAddress"
          label="Site Address*"
          value={property.siteAddress}
          onChange={handleInput("siteAddress")}
          error={errors.siteAddress}
        />
        <FormInput
          id="siteAddress2"
          label="Site Address 2"
          value={property.siteAddress2}
          onChange={handleInput("siteAddress2")}
          error={errors.siteAddress2}
        />
        <FormInput
          id="siteCity"
          label="Site City*"
          value={property.siteCity}
          onChange={handleInput("siteCity")}
          error={errors.siteCity}
        />
        <FormInput
          id="siteZip"
          label="Site Zip*"
          value={property.siteZip}
          onChange={handleInput("siteZip")}
          error={errors.siteZip}
        />
        <FormInput
          id="tenantBusinessName"
          label="Tenant Business Name"
          value={property.tenantBusinessName}
          onChange={handleInput("tenantBusinessName")}
          error={errors.tenantBusinessName}
        />
        <FormInput
          id="tenantContactName"
          label="Tenant Contact Name"
          value={property.tenantContactName}
          onChange={handleInput("tenantContactName")}
          error={errors.tenantContactName}
        />
        <FormInput
          id="tenantContactPhone"
          label="Tenant Contact Phone"
          value={property.tenantContactPhone}
          onChange={handleInput("tenantContactPhone")}
          error={errors.tenantContactPhone}
        />
        <FormInput
          id="tenantContactCell"
          label="Tenant Contact Cell"
          value={property.tenantContactCell}
          onChange={handleInput("tenantContactCell")}
          error={errors.tenantContactCell}
        />
        <FormInput
          id="tenantContactEmail"
          label="Tenant Contact Email"
          value={property.tenantContactEmail}
          onChange={handleInput("tenantContactEmail")}
          error={errors.tenantContactEmail}
          type="email"
        />
        <FormInput
          id="hoursOfOperation"
          label="Hours Of Operation"
          value={property.hoursOfOperation}
          onChange={handleInput("hoursOfOperation")}
          error={errors.hoursOfOperation}
        />

        <label
          className="flex flex-col gap-2 text-sm font-semibold text-slate-800"
          htmlFor="leakLocation"
        >
          Leak Location
          <select
            id="leakLocation"
            name="leakLocation"
            value={property.leakLocation}
            onChange={(event) =>
              onPropertyChange(
                "leakLocation",
                event.target.value as LeakingProperty["leakLocation"],
              )
            }
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
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
            value={property.leakNear}
            onChange={(event) =>
              onPropertyChange(
                "leakNear",
                event.target.value as LeakingProperty["leakNear"],
              )
            }
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
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
          value={property.leakNearOther}
          onChange={handleInput("leakNearOther")}
          error={errors.leakNearOther}
        />
        <label
          className="flex flex-col gap-2 text-sm font-semibold text-slate-800"
          htmlFor="roofPitch"
        >
          Roof Pitch
          <select
            id="roofPitch"
            name="roofPitch"
            value={property.roofPitch}
            onChange={(event) =>
              onPropertyChange(
                "roofPitch",
                event.target.value as LeakingProperty["roofPitch"],
              )
            }
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
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
                checked={property.hasAccessCode}
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
                checked={property.isSaturdayAccessPermitted}
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
                checked={property.isKeyRequired}
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
                checked={property.isLadderRequired}
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
            value={property.accessCode}
            onChange={handleInput("accessCode")}
            error={errors.accessCode}
          />
        </div>

        <FormTextarea
          id="comments"
          label="Comments"
          value={property.comments}
          onChange={(event) => onPropertyChange("comments", event.target.value)}
          error={errors.comments}
          className="md:col-span-2 flex flex-col gap-2 text-sm font-semibold text-slate-800"
        />
      </div>
    </section>
  );
}

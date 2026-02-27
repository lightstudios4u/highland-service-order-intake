import { ChangeEvent, useMemo, useState } from "react";
import { LuHouse } from "react-icons/lu";
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
import PropertyTable from "@/components/emergencyLeakService/PropertyTable";

type LeakingPropertySectionProps = {
  properties: LeakingProperty[];
  editingIndex: number | null;
  editorProperty: LeakingProperty;
  errors: ValidationErrors;
  onEditorChange: <K extends keyof LeakingProperty>(
    field: K,
    value: LeakingProperty[K],
  ) => void;
  onAddOrUpdate: () => void;
  onSaveAndAddAnother: () => void;
  onEditSelect: (index: number) => void;
  onCancelEdit: () => void;
  onCopy: (index: number) => void;
  onDelete: (index: number) => void;
  prefillLeaks: LeakDetailsPayload[];
  onPrefillLeak: (leak: LeakDetailsPayload) => void;
};

export default function LeakingPropertySection({
  properties,
  editingIndex,
  editorProperty,
  errors,
  onEditorChange,
  onAddOrUpdate,
  onSaveAndAddAnother,
  onEditSelect,
  onCancelEdit,
  onCopy,
  onDelete,
  prefillLeaks,
  onPrefillLeak,
}: LeakingPropertySectionProps) {
  const [previewData, setPreviewData] = useState<LeakDetailsPayload | null>(
    null,
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const isPreviewing = previewData !== null;

  const displayed = {
    siteName: previewData?.SiteName ?? editorProperty.siteName,
    siteAddress: previewData?.SiteAddress ?? editorProperty.siteAddress,
    siteAddress2: previewData?.SiteAddress2 ?? editorProperty.siteAddress2,
    siteCity: previewData?.SiteCity ?? editorProperty.siteCity,
    siteZip: previewData?.SiteZip ?? editorProperty.siteZip,
    tenantBusinessName:
      previewData?.TenantBusinessName ?? editorProperty.tenantBusinessName,
    tenantContactName:
      previewData?.TenantContactName ?? editorProperty.tenantContactName,
    tenantContactPhone:
      previewData?.TenantContactPhone ?? editorProperty.tenantContactPhone,
    tenantContactCell:
      previewData?.TenantContactCell ?? editorProperty.tenantContactCell,
    tenantContactEmail:
      previewData?.TenantContactEmail ?? editorProperty.tenantContactEmail,
    hoursOfOperation:
      previewData?.HoursOfOperation ?? editorProperty.hoursOfOperation,
    leakNearOther: previewData?.LeakNearOther ?? editorProperty.leakNearOther,
    accessCode: previewData?.AccessCode ?? editorProperty.accessCode,
    comments: previewData?.Comments ?? editorProperty.comments,
    leakLocation: previewData?.LeakLocation ?? editorProperty.leakLocation,
    leakNear: previewData?.LeakNear ?? editorProperty.leakNear,
    roofPitch: previewData?.RoofPitch ?? editorProperty.roofPitch,
    hasAccessCode: previewData?.HasAccessCode ?? editorProperty.hasAccessCode,
    isSaturdayAccessPermitted:
      previewData?.IsSaturdayAccessPermitted ??
      editorProperty.isSaturdayAccessPermitted,
    isKeyRequired: previewData?.IsKeyRequired ?? editorProperty.isKeyRequired,
    isLadderRequired:
      previewData?.IsLadderRequired ?? editorProperty.isLadderRequired,
  };

  const handleInput =
    <K extends keyof LeakingProperty>(field: K) =>
    (event: ChangeEvent<HTMLInputElement>) =>
      onEditorChange(field, event.target.value as LeakingProperty[K]);

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

  const isEditing = editingIndex !== null;

  function handleRowSelect(index: number) {
    // Toggle selection; deselect if already selected
    setSelectedIndex((prev) => (prev === index ? null : index));
  }

  function handleEditSelect(index: number) {
    setSelectedIndex(null);
    onEditSelect(index);
  }

  function handleCopyFromSelection() {
    if (selectedIndex === null) return;
    onCopy(selectedIndex);
    setSelectedIndex(null);
  }

  return (
    <section className="rounded-lg border border-slate-300">
      <div className="rounded-t-lg bg-slate-700 px-4 py-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
          <LuHouse className="text-xl" /> Property and Leak Info
          {properties.length > 0 && (
            <span className="ml-2 text-sm font-normal text-slate-300">
              ({properties.length} {properties.length === 1 ? "leak" : "leaks"})
            </span>
          )}
        </h2>
      </div>
      <div className="bg-white p-4">
        {/* ── Summary table + controls row ── */}
        {properties.length > 0 && (
          <div className="mb-5">
            <PropertyTable
              properties={properties}
              editingIndex={editingIndex}
              selectedIndex={selectedIndex}
              onSelect={handleRowSelect}
              onEdit={handleEditSelect}
              onCancelEdit={onCancelEdit}
              onCopy={(index) => {
                onCopy(index);
                setSelectedIndex(null);
              }}
              onDelete={onDelete}
            />
            {/* Copy info to new leak — shown when a row is selected */}
            {selectedIndex !== null && !isEditing && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  Leak #{selectedIndex + 1} selected
                </span>
                <button
                  type="button"
                  onClick={handleCopyFromSelection}
                  className="inline-flex items-center gap-1.5 rounded-md border border-sky-500 bg-sky-50 px-3 py-1.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
                >
                  Copy info to new leak
                </button>
              </div>
            )}
            {/* Prefill dropdown */}
            {options.length > 0 && (
              <div className="mt-3">
                <PrefillDropdown
                  options={options}
                  onSelect={onPrefillLeak}
                  onPreview={setPreviewData}
                  accentColor="green"
                />
              </div>
            )}
          </div>
        )}

        {/* Prefill dropdown when no leaks yet */}
        {properties.length === 0 && options.length > 0 && (
          <div className="mb-5">
            <PrefillDropdown
              options={options}
              onSelect={onPrefillLeak}
              onPreview={setPreviewData}
              accentColor="green"
            />
          </div>
        )}
        {isEditing && editingIndex !== null && (
          <div className="mb-4 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2">
            <LuHouse className="shrink-0 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-800">
              Editing Leak #{editingIndex + 1}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-x-5 gap-y-3 md:grid-cols-2">
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
            label="Address 2/Suite #"
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
                onEditorChange(
                  "leakLocation",
                  event.target.value as LeakingProperty["leakLocation"],
                )
              }
              className={`w-full rounded-md border px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 ${previewInputClass}`}
            >
              <option value="">Choose one</option>
              <option value="Front">Front</option>
              <option value="Middle">Middle</option>
              <option value="Back">Back</option>
            </select>
          </label>

          <div
            className={`flex flex-col gap-2 ${displayed.leakNear === "Other" || editorProperty.leakNear === "Other" ? "md:col-span-2" : ""}`}
          >
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
                  onEditorChange(
                    "leakNear",
                    event.target.value as LeakingProperty["leakNear"],
                  )
                }
                className={`w-full rounded-md border px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 ${previewInputClass}`}
              >
                <option value="">Choose one</option>
                <option value="HVACDuct">HVAC Duct</option>
                <option value="Skylight">Skylight</option>
                <option value="Wall">Wall</option>
                <option value="Drain">Drain</option>
                <option value="Other">Other</option>
              </select>
            </label>

            {(displayed.leakNear === "Other" ||
              editorProperty.leakNear === "Other") && (
              <FormTextarea
                id="leakNearOther"
                label="Describe Leak Location Thoroughly"
                value={displayed.leakNearOther}
                onChange={(event) =>
                  onEditorChange("leakNearOther", event.target.value)
                }
                error={errors.leakNearOther}
                previewing={isPreviewing}
              />
            )}
          </div>
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
                onEditorChange(
                  "roofPitch",
                  event.target.value as LeakingProperty["roofPitch"],
                )
              }
              className={`w-full rounded-md border px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 ${previewInputClass}`}
            >
              <option value="">Choose one</option>
              <option value="FlatRoof">Flat Roof</option>
              <option value="SteepShingleTile">Steep Shingle/Tile</option>
            </select>
          </label>

          <div className="md:col-span-2">
            <div className="flex w-full flex-col gap-3 rounded-md border border-slate-200 p-4 sm:flex-row sm:flex-wrap sm:items-start sm:gap-x-8 sm:gap-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={displayed.hasAccessCode}
                  onChange={(event) =>
                    onEditorChange("hasAccessCode", event.target.checked)
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
                    onEditorChange(
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
                    onEditorChange("isKeyRequired", event.target.checked)
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
                    onEditorChange("isLadderRequired", event.target.checked)
                  }
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                Ladder Required
              </label>
            </div>

            {displayed.hasAccessCode && (
              <div className="mt-3 max-w-sm">
                <FormInput
                  id="accessCode"
                  label="Access Code"
                  value={displayed.accessCode}
                  onChange={handleInput("accessCode")}
                  error={errors.accessCode}
                  previewing={isPreviewing}
                />
              </div>
            )}
          </div>

          <FormTextarea
            id="comments"
            label="Comments*"
            value={displayed.comments}
            onChange={(event) => onEditorChange("comments", event.target.value)}
            error={errors.comments}
            className="md:col-span-2 flex flex-col gap-2 text-sm font-semibold text-slate-800"
            previewing={isPreviewing}
          />
        </div>

        {/* ── Add / Update buttons ── */}
        <div className="mt-5 flex items-center justify-end gap-3">
          {isEditing && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="inline-flex items-center justify-center rounded-md border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Cancel
            </button>
          )}
          {isEditing ? (
            <button
              type="button"
              onClick={onAddOrUpdate}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-6 py-2.5 text-base font-semibold text-white transition hover:bg-emerald-700"
            >
              <LuHouse className="text-lg" />
              Update Leak
            </button>
          ) : properties.length === 0 ? (
            <button
              type="button"
              onClick={onSaveAndAddAnother}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-emerald-600 px-6 py-2.5 text-base font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              <LuHouse className="text-lg" />
              Save Leak and Add Another
            </button>
          ) : (
            <button
              type="button"
              onClick={onAddOrUpdate}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-6 py-2.5 text-base font-semibold text-white transition hover:bg-emerald-700"
            >
              <LuHouse className="text-lg" />
              Add Leak
            </button>
          )}
        </div>

        {/* Error when no properties added yet at submit time */}
        {properties.length === 0 &&
          errors.siteName === "At least one property is required." && (
            <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {errors.siteName}
            </p>
          )}
      </div>
    </section>
  );
}

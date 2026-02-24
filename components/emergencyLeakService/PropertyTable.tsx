import { LeakingProperty } from "@/types/emergencyLeakService";
import { LuCopy, LuPencil, LuTrash2 } from "react-icons/lu";

type PropertyTableProps = {
  properties: LeakingProperty[];
  editingIndex: number | null;
  onEdit: (index: number) => void;
  onCancelEdit: () => void;
  onCopy: (index: number) => void;
  onDelete: (index: number) => void;
};

const LEAK_LOCATION_LABELS: Record<string, string> = {
  Front: "Front",
  Middle: "Middle",
  Back: "Back",
};

export default function PropertyTable({
  properties,
  editingIndex,
  onEdit,
  onCancelEdit,
  onCopy,
  onDelete,
}: PropertyTableProps) {
  if (properties.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <th className="px-3 py-2">#</th>
            <th className="px-3 py-2">Site Name</th>
            <th className="hidden px-3 py-2 md:table-cell">Address</th>
            <th className="hidden px-3 py-2 lg:table-cell">City</th>
            <th className="hidden px-3 py-2 lg:table-cell">Leak Location</th>
            <th className="px-3 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((property, index) => {
            const isEditing = editingIndex === index;
            return (
              <tr
                key={index}
                className={`border-b border-slate-100 transition ${
                  isEditing
                    ? "bg-emerald-50 ring-1 ring-inset ring-emerald-300"
                    : "hover:bg-slate-50"
                }`}
              >
                <td className="px-3 py-2 font-medium text-slate-700">
                  {index + 1}
                </td>
                <td className="px-3 py-2 font-medium text-slate-900">
                  {property.siteName || (
                    <span className="italic text-slate-400">Unnamed</span>
                  )}
                </td>
                <td className="hidden px-3 py-2 text-slate-600 md:table-cell">
                  {property.siteAddress || "—"}
                </td>
                <td className="hidden px-3 py-2 text-slate-600 lg:table-cell">
                  {property.siteCity || "—"}
                </td>
                <td className="hidden px-3 py-2 text-slate-600 lg:table-cell">
                  {LEAK_LOCATION_LABELS[property.leakLocation] ??
                    property.leakLocation}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        isEditing ? onCancelEdit() : onEdit(index)
                      }
                      title={isEditing ? "Stop editing" : "Edit"}
                      className={`rounded p-1.5 transition ${
                        isEditing
                          ? "bg-emerald-600 text-white"
                          : "text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                      }`}
                    >
                      <LuPencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onCopy(index)}
                      title="Copy"
                      className="rounded p-1.5 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                    >
                      <LuCopy className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(index)}
                      title="Delete"
                      className="rounded p-1.5 text-slate-500 transition hover:bg-red-100 hover:text-red-600"
                    >
                      <LuTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

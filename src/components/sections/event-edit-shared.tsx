import { Pencil, Trash2 } from "lucide-react";

export const INPUT_CLS =
  "w-full px-3 py-2 border border-gray-300 rounded-lg";
export const LABEL_CLS = "block text-sm font-medium text-gray-700 mb-1";

const FK_FIELDS = new Set([
  "event_id",
  "file_id",
  "category_id",
  "batch_id",
]);

/** Extract primary-key `id` from a sub-resource item regardless of the API field name. */
export function getItemId(item: { id?: string }): string {
  if (typeof item.id === "string" && item.id) return item.id;
  const record = item as unknown as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (
      key.endsWith("_id") &&
      !FK_FIELDS.has(key) &&
      typeof record[key] === "string" &&
      record[key]
    ) {
      return record[key] as string;
    }
  }
  return "";
}

export function ItemRow({
  children,
  onDelete,
  onEdit,
}: {
  children: React.ReactNode;
  onDelete: () => void;
  onEdit?: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
      <div>{children}</div>
      <div className="flex items-center gap-1 shrink-0">
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="text-gray-600 hover:bg-gray-200 p-1 rounded"
            aria-label="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onDelete}
          className="text-red-500 hover:bg-red-50 p-1 rounded"
          aria-label="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

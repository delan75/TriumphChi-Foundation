import { Pencil, Trash2 } from 'lucide-react';
import type { BlogCategoryRecord, BlogTagRecord } from '../../../lib/api';
import { cn } from '../../../components/ui/cn';

type TaxonomyItem = BlogCategoryRecord | BlogTagRecord;

interface TaxonomyRecordsProps {
  title: string;
  items: TaxonomyItem[];
  selectedUuid?: string | null;
  canUpdate: boolean;
  onEdit: (uuid: string) => void;
  onDelete: (uuid: string) => void;
}

export function TaxonomyRecords({ title, items, selectedUuid, canUpdate, onEdit, onDelete }: TaxonomyRecordsProps) {
  if (items.length === 0) {
    return <div className="rounded-md border border-ink-100 bg-ink-50 p-4 text-sm font-bold text-ink-500">No {title.toLowerCase()} found.</div>;
  }

  return (
    <div className="min-w-0">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-ink-100">
          <thead>
            <tr className="text-left text-xs font-black uppercase text-ink-400">
              <th className="px-3 py-3">Name</th>
              <th className="px-3 py-3">Slug</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {items.map((item) => (
              <tr
                key={item.uuid}
                className={cn('transition hover:bg-foundation-50/70', selectedUuid === item.uuid ? 'bg-foundation-50' : 'bg-white')}
              >
                <td className="px-3 py-4">
                  <p className="text-sm font-black text-ink-900">{item.label}</p>
                </td>
                <td className="px-3 py-4 text-sm font-bold text-ink-700">{item.slug.en || item.slug.fr || '-'}</td>
                <td className="px-3 py-4">
                  <div className="flex justify-end gap-2">
                    {canUpdate ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onEdit(item.uuid)}
                          className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-md bg-foundation-600 px-3 text-xs font-black text-white transition hover:bg-foundation-900"
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(item.uuid)}
                          className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-md border border-red-200 bg-white px-3 text-xs font-black text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                          Delete
                        </button>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

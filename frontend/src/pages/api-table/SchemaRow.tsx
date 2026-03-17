import React from 'react';
import { ChevronDown, Trash2 } from 'lucide-react';
import type { ApiSchemaRow } from '../../types';
import SelectableInput from '../../components/SelectableInput';

interface SchemaRowProps {
  row: ApiSchemaRow;
  onChange: (row: ApiSchemaRow) => void;
  onDelete?: () => void;
  descriptionPlaceholder: string;
}

const SchemaRow: React.FC<SchemaRowProps> = ({
  row,
  onChange,
  onDelete,
  descriptionPlaceholder,
}) => (
  <tr className="hover:bg-slate-50/50 group">
    <td className="px-3 py-1.5">
      <div
        className="flex items-center gap-2"
        style={{ paddingLeft: `${(row.depth ?? 0) * 20}px` }}
      >
        {row.type === 'object' || row.type === 'array' ? (
          <ChevronDown size={12} className="text-slate-400" />
        ) : (
          <div className="w-3" />
        )}
        <input
          type="text"
          value={row.name}
          onChange={(e) => onChange({ ...row, name: e.target.value })}
          className="bg-transparent outline-none text-slate-900 font-mono text-xs w-full"
        />
      </div>
    </td>
    <td className="px-3 py-1.5">
      <SelectableInput
        options={['string', 'number', 'boolean', 'object', 'array', 'integer']}
        value={row.type}
        onChange={(val) =>
          onChange({
            ...row,
            type: val as ApiSchemaRow['type'],
          })
        }
        allowCustom={false}
        showSearch={false}
        size="sm"
        inputClassName="bg-slate-100 border-none rounded"
        className="w-24"
      />
    </td>
    <td className="px-3 py-1.5 text-center">
      <input
        type="checkbox"
        checked={row.required}
        onChange={(e) => onChange({ ...row, required: e.target.checked })}
        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
      />
    </td>
    <td className="px-3 py-1.5">
      <input
        type="text"
        value={row.desc || ''}
        onChange={(e) => onChange({ ...row, desc: e.target.value })}
        placeholder={descriptionPlaceholder}
        className="w-full bg-transparent outline-none text-slate-400 italic text-xs"
      />
    </td>
    <td className="px-3 py-1.5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        type="button"
        onClick={onDelete}
        className="p-1 text-slate-300 hover:text-rose-500 cursor-pointer"
      >
        <Trash2 size={12} />
      </button>
    </td>
  </tr>
);

export default SchemaRow;

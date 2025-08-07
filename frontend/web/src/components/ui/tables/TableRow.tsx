import React from 'react'
import RemoveRowCell from '@/components/ui/tables/RemoveRowCell'
import { TableColumn } from '@/types/table'

interface TableRowProps<T> {
	row: T
	rowKey: string
	columns: TableColumn<T>[]
	canRemoveRow?: boolean
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onCellUpdate: (id: any, field: keyof T, value: any) => void
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onRemoveRow: (id: any) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TableRow<T extends Record<string, any>>({
	row,
	rowKey,
	columns,
	canRemoveRow,
	onCellUpdate,
	onRemoveRow,
}: TableRowProps<T>) {
	return (
		<tr
			key={row[rowKey]}
			className='bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
		>
			{columns.map((col, colIdx) => (
				<td className='px-6 py-4' key={String(row[rowKey]) + '-' + colIdx}>
					{col.isEditable ? (
						col.inputType === 'textarea' ? (
							<textarea
								rows={2}
								value={String(row[col.accessor as keyof T] || '')}
								onChange={(e) =>
									onCellUpdate(
										row[rowKey],
										col.accessor as keyof T,
										e.target.value,
									)
								}
							/>
						) : (
							<input
								type='text'
								value={String(row[col.accessor as keyof T] || '')}
								onChange={(e) =>
									onCellUpdate(
										row[rowKey],
										col.accessor as keyof T,
										e.target.value,
									)
								}
							/>
						)
					) : (
						String(col.accessor ? row[col.accessor as keyof T] : null)
					)}
				</td>
			))}
			{canRemoveRow && (
				<RemoveRowCell id={row[rowKey]} onRemoveRow={onRemoveRow} />
			)}
		</tr>
	)
}

export default TableRow

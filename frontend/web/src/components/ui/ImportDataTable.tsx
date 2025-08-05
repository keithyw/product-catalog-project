import React from 'react'
import Button from '@/components/ui/form/Button'
import { TableColumn } from '@/types/table'
import { TrashIcon } from '@heroicons/react/24/solid'

interface ImportDataTableProps<T> {
	data: T[]
	columns: TableColumn<T>[]
	rowKey: keyof T
	onDataChange: (updatedData: T[]) => void
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onRemoveRow: (id: any) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ImportDataTableComponent<T extends Record<string, any>>({
	data,
	columns,
	rowKey,
	onDataChange,
	onRemoveRow,
}: ImportDataTableProps<T>) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleCellUpdate = (id: any, field: keyof T, value: any) => {
		const updatedData = data.map((i) =>
			i[rowKey] === id ? { ...i, [field]: value } : i,
		)
		onDataChange(updatedData)
	}

	return (
		<div className='shadow-md sm:rounded-lg'>
			<table className='w-full text-sm text-left text-gray-500 data:text-gray-400'>
				<thead className='text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
					<tr>
						{columns.map((col, idx) => (
							<th scope='col' className='px-6 py-3' key={col.header || idx}>
								<span className='flex items-center gap-1 focus:outline-none'>
									{col.header}
								</span>
							</th>
						))}
						<th scope='col' className='px-6 py-3'>
							<span className='flex items-center gap-1 focus:outline-none'>
								Remove
							</span>
						</th>
					</tr>
				</thead>
				<tbody>
					{data && data.length > 0 ? (
						data.map((row) => (
							<tr
								key={String(row[rowKey])}
								className='bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
							>
								{columns.map((col, colIdx) => (
									<td
										className='px-6 py-4'
										key={String(row[rowKey]) + '-' + colIdx}
									>
										{col.isEditable ? (
											col.inputType === 'textarea' ? (
												<textarea
													rows={2}
													value={String(row[col.accessor as keyof T] || '')}
													onChange={(e) =>
														handleCellUpdate(
															row[rowKey],
															col.accessor ? col.accessor : '',
															e.target.value,
														)
													}
												/>
											) : (
												<input
													type='text'
													value={String(row[col.accessor as keyof T] || '')}
													onChange={(e) =>
														handleCellUpdate(
															row[rowKey],
															col.accessor ? col.accessor : '',
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
								<td className='px-6 py-4'>
									<Button
										actionType='danger'
										title='Remove Row'
										onClick={() => onRemoveRow(row[rowKey])}
										className='p-2 rounded-md transition-colors duration-200'
									>
										<TrashIcon className='h-4 w-4 text-white' />
									</Button>
								</td>
							</tr>
						))
					) : (
						<tr>
							<td
								colSpan={columns.length}
								className='text-center py-4 text-gray-500'
							>
								No data
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	)
}

const ImportDataTable = React.memo(
	ImportDataTableComponent,
) as typeof ImportDataTableComponent

export default ImportDataTable

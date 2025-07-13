import SearchInput from '@/components/ui/SearchInput'
import { TableColumn, TableRowAction } from '@/types/table'

interface DataTableProps<T> {
	data: T[]
	columns: TableColumn<T>[]
	rowKey: keyof T
	actions?: TableRowAction<T>[]
	emptyMessage?: string
	searchTerm?: string
	onSearch?: (term: string) => void
	searchPlaceholder?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DataTable = <T extends Record<string, any>>({
	data,
	columns,
	rowKey,
	actions,
	emptyMessage = 'No data available',
	searchTerm,
	onSearch,
	searchPlaceholder,
}: DataTableProps<T>) => {
	const totalColumns = columns.length + (actions && actions.length > 0 ? 1 : 0)
	return (
		<div className='overflow-x-auto shadow-md sm:rounded-lg'>
			{onSearch && (
				<div className='p-4 bg-white dark:bg-gray-800 rounded-t-lg border-b dark:border-gray-700'>
					<SearchInput
						value={searchTerm || ''}
						onChange={onSearch}
						placeholder={searchPlaceholder}
						className='max-w-xs'
					/>
				</div>
			)}
			<table className='w-full text-sm text-left text-gray-500 data:text-gray-400'>
				<thead className='text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
					<tr>
						{columns.map((col, idx) => (
							<th scope='col' className='px-6 py-3' key={col.header || idx}>
								{col.header}
							</th>
						))}
						{actions && actions.length > 0 && (
							<th scope='col' className='px-6 py-3 text-right'>
								<span>Actions</span>
							</th>
						)}
					</tr>
				</thead>
				<tbody>
					{data && data.length > 0 ? (
						data.map((row) => (
							<tr
								key={String(row[rowKey])}
								className='bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
							>
								{columns.map((col, colIndex) => (
									<td
										className='px-6 py-4'
										key={String(row[rowKey]) + '-' + colIndex}
									>
										{col.render
											? col.render(row)
											: col.accessor
												? row[col.accessor as keyof T]
												: null}
									</td>
								))}
								{actions && actions.length > 0 && (
									<td className='px-6 py-4 text-right whitespace-nowrap'>
										{actions.map((action, actionIndex) => (
											<button
												key={`action-${String(row[rowKey])}-${actionIndex}`}
												onClick={() => action.onClick(row)}
												className={`
                                                px-3 py-1 rounded-md text-white
                                                ${action.className || 'bg-blue-500 hover:bg-blue-600'} 
                                                ${actionIndex > 0 ? 'ml-2' : ''}
                                            `}
											>
												{action.label}
											</button>
										))}
									</td>
								)}
							</tr>
						))
					) : (
						<tr>
							<td
								colSpan={totalColumns}
								className='text-center py-8 text-gray-500'
							>
								{searchTerm && onSearch
									? `No results for "${searchTerm}"`
									: emptyMessage}
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	)
}

export default DataTable

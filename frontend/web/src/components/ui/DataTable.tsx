import React from 'react'
import SearchInput from '@/components/ui/SearchInput'
import SpinnerSection from '@/components/ui/SpinnerSection'
import { TableColumn, TableRowAction } from '@/types/table'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid'

interface DataTableProps<T> {
	data: T[]
	columns: TableColumn<T>[]
	rowKey: keyof T
	actions?: TableRowAction<T>[]
	emptyMessage?: string
	searchTerm?: string
	onSearch?: (term: string) => void
	searchPlaceholder?: string

	// pagination
	currentPage?: number
	pageSize?: number
	totalCount?: number
	onPageChange?: (page: number) => void
	onPageSizeChange?: (size: number) => void
	pageSizes?: number[]
	isLoadingRows?: boolean

	// sorting
	onSort?: (field: string) => void
	// onSort?: (field: string) => void
	currentSortField?: string
	currentSortDirection?: 'asc' | 'desc'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DataTableComponent<T extends Record<string, any>>({
	data,
	columns,
	rowKey,
	actions,
	emptyMessage = 'No data available',
	searchTerm,
	onSearch,
	searchPlaceholder,

	// pagination props
	currentPage = 1,
	pageSize = 10,
	totalCount = 0,
	onPageChange,
	onPageSizeChange,
	pageSizes = [10, 25, 50, 100],
	isLoadingRows = false,

	// sorting props
	onSort,
	currentSortField,
	currentSortDirection,
}: DataTableProps<T>) {
	const totalColumns = columns.length + (actions && actions.length > 0 ? 1 : 0)
	const totalPages = Math.ceil(totalCount / pageSize)

	const handlePreviousPage = () => {
		if (onPageChange && currentPage > 1) {
			onPageChange(currentPage - 1)
		}
	}

	const handleNextPage = () => {
		if (onPageChange && currentPage < totalPages) {
			onPageChange(currentPage + 1)
		}
	}

	const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		if (onPageSizeChange) {
			onPageSizeChange(Number(e.target.value))
			void onPageChange?.(1)
		}
	}

	return (
		<div className='overflow-x-auto shadow-md sm:rounded-lg'>
			{(onSearch || onPageChange) && (
				<div className='p-4 bg-white dark:bg-gray-800 rounded-t-lg border-b dark:border-gray-700 flex justify-between items-center'>
					{onSearch && (
						<SearchInput
							value={searchTerm || ''}
							onChange={onSearch}
							placeholder={searchPlaceholder}
							className='max-w-xs'
						/>
					)}
					{onPageChange && (
						<div className='flex items-center space-x-4'>
							<span className='text-gray-700 dark:text-gray-300 text-sm'>
								Items per page:
							</span>
							<select
								value={pageSize}
								onChange={handlePageSizeChange}
								className='
									block
									w-20
									px-3
									py-1
									text-sm
									text-gray-700
									bg-white
									border
									border-gray-300
									rounded-md
									shadow-sm
									focus:outline-none
									focus:ring-blue-500
									focus:border-blue-500
									dark:bg-gray-700
									dark:border-gray-600
									dark:text-white
								'
							>
								{pageSizes.map((s) => (
									<option key={s} value={s}>
										{s}
									</option>
								))}
							</select>
							<span className='text-sm text-gray-700 dark:text-gray-300'>
								Page {currentPage} of {totalPages}
							</span>
							<button
								onClick={handlePreviousPage}
								disabled={currentPage === 1}
								className='
									px-3
									py-1
									text-sm
									font-medium
									text-blue-600
									dark:text-blue-500
									bg-gray-100
									dark:bg-gray-700
									rounded-md
									hover:bg-gray-200
									dark:hover:bg-gray-600
									disabled:opacity-50
									disabled:cursor-not-allowed
									cursor-pointer
								'
							>
								Previous
							</button>
							<button
								onClick={handleNextPage}
								disabled={currentPage === totalPages}
								className='
									px-3
									py-1
									text-sm
									font-medium
									text-blue-600
									dark:text-blue-500
									bg-gray-100
									dark:bg-gray-700
									rounded-md
									hover:bg-gray-200
									dark:hover:bg-gray-600
									disabled:opacity-50
									disabled:cursor-not-allowed
									cursor-pointer
								'
							>
								Next
							</button>
						</div>
					)}
				</div>
			)}
			<table className='w-full text-sm text-left text-gray-500 data:text-gray-400'>
				<thead className='text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
					<tr>
						{columns.map((col, idx) => (
							<th
								scope='col'
								className={`px-6 py-3 ${col.sortable ? 'cursor-pointer' : ''}`}
								key={col.header || idx}
								onClick={() => {
									if (col.sortable && (col.sortField || col.accessor)) {
										if (onSort) {
											onSort(col.sortField || (col.accessor as string))
										}
									}
								}}
							>
								{col.sortable && onSort ? (
									<span className='flex items-center gap-1 focus:outline-none'>
										{col.header}
										{currentSortField ===
											(col.sortField ||
												(col.accessor ? String(col.accessor) : '')) &&
											(currentSortDirection === 'asc' ? (
												<ChevronUpIcon className='w-4 h-4 text-gray-500' />
											) : (
												<ChevronDownIcon className='w-4 h-4 text-gray-500' />
											))}
									</span>
								) : (
									col.header
								)}
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
					{isLoadingRows ? (
						<tr>
							<td colSpan={totalColumns} className='text-center py-8'>
								<SpinnerSection spinnerMessage='Loading data...' />
							</td>
						</tr>
					) : data && data.length > 0 ? (
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
const DataTable = React.memo(DataTableComponent) as typeof DataTableComponent

export default DataTable

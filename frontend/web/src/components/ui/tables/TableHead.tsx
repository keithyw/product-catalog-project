import React from 'react'
import { TableColumn } from '@/types/table'

interface TableHeadProps<T> {
	columns: TableColumn<T>[]
	showRemove?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TableHead<T extends Record<string, any>>({
	columns,
	showRemove,
}: TableHeadProps<T>) {
	return (
		<thead className='text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
			<tr>
				{columns.map((col, idx) => (
					<th scope='col' className='px-6 py-3' key={col.header || idx}>
						<span className='flex items-center gap-1focus:outline-none'>
							{col.header}
						</span>
					</th>
				))}
				{showRemove && (
					<th scope='col' className='px-6 py-3'>
						<span className='flex items-center gap-1 focus:outline-none'>
							Remove
						</span>
					</th>
				)}
			</tr>
		</thead>
	)
}

export default TableHead

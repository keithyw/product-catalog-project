import React from 'react'
import EmptyDataRow from '@/components/ui/tables/EmptyDataRow'
import TableHead from '@/components/ui/tables/TableHead'
import TableRow from '@/components/ui/tables/TableRow'
import TableWrapper from '@/components/ui/tables/TableWrapper'
import { TableColumn } from '@/types/table'

interface ImportDataTableProps<T> {
	data: T[]
	columns: TableColumn<T>[]
	rowKey: keyof T
	canRemoveRow?: boolean
	onDataChange: (updatedData: T[]) => void
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onRemoveRow: (id: any) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ImportDataTableComponent<T extends Record<string, any>>({
	data,
	columns,
	rowKey,
	canRemoveRow,
	onDataChange,
	onRemoveRow,
}: ImportDataTableProps<T>) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	type GenericData<U> = U & { id?: any; children?: GenericData<U>[] }

	const handleCellUpdate = (
		items: GenericData<T>[],
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		id: any,
		field: keyof T,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		value: any,
	): GenericData<T>[] => {
		const updateData = items.map((item) =>
			item[rowKey] === id ? { ...item, [field]: value } : item,
		)
		return updateData
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onCellUpdate = (id: any, field: keyof T, value: any): void => {
		const updatedData = handleCellUpdate(
			data as GenericData<T>[],
			id,
			field,
			value,
		)
		onDataChange(updatedData as T[])
	}

	return (
		<TableWrapper>
			<TableHead columns={columns} showRemove={canRemoveRow} />
			<tbody>
				{data && data.length > 0 ? (
					data.map((row) => (
						<TableRow
							key={String(row[rowKey])}
							row={row}
							rowKey={rowKey as string}
							columns={columns}
							canRemoveRow={canRemoveRow}
							onCellUpdate={onCellUpdate}
							onRemoveRow={onRemoveRow}
						/>
					))
				) : (
					<EmptyDataRow colspan={columns.length} />
				)}
			</tbody>
		</TableWrapper>
	)
}

const ImportDataTable = React.memo(
	ImportDataTableComponent,
) as typeof ImportDataTableComponent

export default ImportDataTable

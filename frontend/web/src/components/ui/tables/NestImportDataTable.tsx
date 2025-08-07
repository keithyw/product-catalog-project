import React from 'react'
import EmptyDataRow from '@/components/ui/tables/EmptyDataRow'
import TableHead from '@/components/ui/tables/TableHead'
import TableRow from '@/components/ui/tables/TableRow'
import TableWrapper from '@/components/ui/tables/TableWrapper'
import { TableColumn } from '@/types/table'

interface NestedImportDataTableProps<T> {
	data: T[]
	columns: TableColumn<T>[]
	rowKey: keyof T
	canRemoveRow?: boolean
	onDataChange: (updatedData: T[]) => void
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onRemoveRow: (id: any) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function NestedImportDataTable<T extends Record<string, any>>({
	data,
	columns,
	rowKey,
	canRemoveRow,
	onDataChange,
	onRemoveRow,
}: NestedImportDataTableProps<T>) {
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
		return items.map((item) => {
			if (item[rowKey] === id) {
				return { ...item, [field]: value }
			}
			if (item.children && item.children.length > 0) {
				return {
					...item,
					children: handleCellUpdate(item.children, id, field, value),
				}
			}
			return item
		})
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

	const renderRows = (items: T[], level: number = 0) => {
		return items.map((i) => (
			<React.Fragment key={String(i[rowKey])}>
				<TableRow
					key={String(i[rowKey])}
					row={i}
					rowKey={rowKey as string}
					columns={columns}
					canRemoveRow={canRemoveRow}
					onCellUpdate={onCellUpdate}
					onRemoveRow={onRemoveRow}
				/>
				{i.children &&
					i.children.length > 0 &&
					renderRows(i.children, level + 1)}
			</React.Fragment>
		))
	}

	return (
		<TableWrapper>
			<TableHead columns={columns} showRemove={canRemoveRow} />
			<tbody>
				{data && data.length > 0 ? (
					renderRows(data)
				) : (
					<EmptyDataRow colspan={columns.length} />
				)}
			</tbody>
		</TableWrapper>
	)
}

export default NestedImportDataTable

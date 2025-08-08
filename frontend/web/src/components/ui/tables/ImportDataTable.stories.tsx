// ImportDataTable.stories.tsx
import type { Meta, StoryObj } from '@storybook/nextjs'
import { action } from 'storybook/actions'
import ImportDataTable from './ImportDataTable'
import { TableColumn } from '@/types/table'

// Define the type for our sample data
interface Brand {
	id: number
	name: string
	code: string
}

// Define the columns for our table
const brandColumns: TableColumn<Brand>[] = [
	{
		accessor: 'id',
		header: 'ID',
	},
	{
		accessor: 'name',
		header: 'Brand Name',
		isEditable: true,
	},
	{
		accessor: 'code',
		header: 'Brand Code',
		isEditable: true,
	},
]

const meta: Meta<typeof ImportDataTable<Brand>> = {
	title: 'Data/ImportDataTable',
	component: ImportDataTable,
	tags: ['autodocs'],
	argTypes: {
		onDataChange: { action: 'data changed' },
		onRemoveRow: { action: 'row removed' },
	},
}

export default meta

type Story = StoryObj<typeof ImportDataTable<Brand>>

// Sample data for the stories
const sampleData: Brand[] = [
	{ id: 1, name: 'Brand A', code: 'brand-a' },
	{ id: 2, name: 'Brand B', code: 'brand-b' },
	{ id: 3, name: 'Brand C', code: 'brand-c' },
]

export const Primary: Story = {
	args: {
		data: sampleData,
		columns: brandColumns,
		rowKey: 'id',
	},
}

export const WithEditableColumns: Story = {
	args: {
		data: sampleData,
		columns: brandColumns.map((col) =>
			col.accessor === 'name' ? { ...col, isEditable: true } : col,
		),
		rowKey: 'id',
		onDataChange: action('onDataChange'),
	},
}

export const WithRemovableRows: Story = {
	args: {
		data: sampleData,
		columns: brandColumns,
		rowKey: 'id',
		canRemoveRow: true,
		onRemoveRow: action('onRemoveRow'),
	},
}

export const EmptyTable: Story = {
	args: {
		data: [],
		columns: brandColumns,
		rowKey: 'id',
	},
}

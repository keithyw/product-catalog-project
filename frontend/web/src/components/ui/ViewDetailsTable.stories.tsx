import type { Meta, StoryObj } from '@storybook/nextjs'
import ViewDetailsTable, { ViewDetailsTableProps } from './ViewDetailsTable'
import { TableColumn } from '@/types/table'

const meta: Meta<typeof ViewDetailsTable> = {
	title: 'UI/ViewDetailsTable',
	component: ViewDetailsTable,
	parameters: {
		layout: 'padded',
		nextjs: {
			appDirectory: true,
		},
	},
	tags: ['autodocs'],
}

export default meta
type Story = StoryObj<ViewDetailsTableProps<MockData>>

interface MockData {
	id: string
	name: string
	price: number
	category: string
}

const mockData: MockData[] = [
	{ id: '1', name: 'Product A', price: 100, category: 'Electronics' },
	{ id: '2', name: 'Product B', price: 200, category: 'Furniture' },
	{ id: '3', name: 'Product C', price: 300, category: 'Clothing' },
]

const columns: TableColumn<MockData>[] = [
	{ header: 'Name', accessor: 'name' },
	{ header: 'Price', accessor: 'price', render: (row) => `$${row.price}` },
	{ header: 'Category', accessor: 'category' },
]

export const Default: Story = {
	render: (args) => (
		<ViewDetailsTable<MockData>
			{...(args as unknown as ViewDetailsTableProps<MockData>)}
		/>
	),
	args: {
		data: mockData,
		columns: columns,
		rowKey: 'id',
	},
}

export const WithRowLink: Story = {
	render: (args) => (
		<ViewDetailsTable<MockData>
			{...(args as unknown as ViewDetailsTableProps<MockData>)}
		/>
	),
	args: {
		data: mockData,
		columns: columns,
		rowKey: 'id',
		getRowHref: (row) => `/products/${row.id}`,
	},
}

export const Empty: Story = {
	render: (args) => (
		<ViewDetailsTable<MockData>
			{...(args as unknown as ViewDetailsTableProps<MockData>)}
		/>
	),
	args: {
		data: [],
		columns: columns,
		rowKey: 'id',
	},
}

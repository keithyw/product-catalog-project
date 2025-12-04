import { SimpleCategory, SimpleProductAttribute } from '@/types/ai'
import { Brand } from '@/types/brand'
import { TableColumn } from '@/types/table'

export const BRAND_COLUMNS: TableColumn<Brand>[] = [
	{
		header: 'ID',
		accessor: 'id',
	},
	{
		header: 'Name',
		accessor: 'name',
		isEditable: true,
		inputType: 'text',
	},
	{
		header: 'Description',
		accessor: 'description',
		isEditable: true,
		inputType: 'textarea',
	},
]

export const CATEGORY_COLUMNS: TableColumn<SimpleCategory>[] = [
	{
		header: 'ID',
		accessor: 'id',
	},
	{
		header: 'Name',
		accessor: 'name',
		isEditable: true,
		inputType: 'text',
	},
	{
		header: 'Description',
		accessor: 'description',
		isEditable: true,
		inputType: 'textarea',
	},
]

export const PRODUCT_ATTRIBUTE_COLUMNS: TableColumn<SimpleProductAttribute>[] =
	[
		{
			header: 'ID',
			accessor: 'id',
		},
		{
			header: 'Name',
			accessor: 'name',
			isEditable: true,
			inputType: 'text',
		},
		{
			header: 'Display Name',
			accessor: 'display_name',
			isEditable: true,
			inputType: 'text',
		},
		{
			header: 'Sample Values',
			accessor: 'sample_values',
			isEditable: true,
			inputType: 'text',
		},
		{
			header: 'Description',
			accessor: 'description',
			isEditable: true,
			inputType: 'textarea',
		},
		{
			header: 'Type',
			accessor: 'type',
			isEditable: true,
			inputType: 'select',
			selectOptions: [
				{ value: 'text', label: 'Text' },
				{ value: 'textarea', label: 'Textarea' },
				{ value: 'number', label: 'Number' },
				{ value: 'boolean', label: 'Boolean' },
				{ value: 'select', label: 'Select' },
				{ value: 'multiselect', label: 'Multiselect' },
				{ value: 'date', label: 'Date' },
				{ value: 'datetime', label: 'Datetime' },
				{ value: 'json', label: 'JSON' },
			],
		},
		{
			header: 'Required',
			accessor: 'is_required',
			isEditable: true,
			inputType: 'checkbox',
		},
		{
			header: 'Default Value',
			accessor: 'default_value',
			isEditable: true,
			inputType: 'text',
		},
		{
			header: 'Options',
			accessor: 'options',
			// isEditable: true,
			inputType: 'textarea',
			isObject: true,
		},
		{
			header: 'Validation Rules',
			accessor: 'validation_rules',
			isEditable: false,
			// inputType: 'textarea',
			isObject: true,
		},
	]

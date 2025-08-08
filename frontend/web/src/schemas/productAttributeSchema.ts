import { z } from 'zod'
// import { ProductAttributeType } from '@/types/product'

const attributeTypes = z.enum([
	'text',
	'textarea',
	'number',
	'boolean',
	'select',
	'multiselect',
	'date',
	'datetime',
	'json',
])

export const productAttributeCreateSchema = z
	.object({
		name: z.string().min(1, 'Name is required.'),
		display_name: z.string().nullable().optional(),
		description: z.string().nullable().optional(),
		type: attributeTypes.default('text').optional(), // Default to 'text' if not provided
		is_required: z.boolean().default(false).optional(),

		// default_value will be a string from the form, parsed later
		default_value: z.string().nullable().optional(),

		// options will be a string (JSON) from the textarea, parsed later
		options: z.string().nullable().optional(),

		// validation_rules will be a string (JSON) from the textarea, parsed later
		validation_rules: z.string().nullable().optional(),
	})
	.refine(
		(data) => {
			// Options are required for select/multiselect types.
			if (data.type === 'select' || data.type === 'multiselect') {
				return data.options && data.options.trim() !== ''
			}
			return true
		},
		{
			message: 'Options are required for select and multi-select types.',
			path: ['options'],
		},
	)
	.refine(
		(data) => {
			// Options must be a valid JSON array with objects containing "value" and "label" keys.
			if (
				(data.type === 'select' || data.type === 'multiselect') &&
				data.options
			) {
				try {
					const parsedOptions = JSON.parse(data.options)
					return (
						Array.isArray(parsedOptions) &&
						parsedOptions.every(
							(item) =>
								typeof item === 'object' &&
								item !== null &&
								'value' in item &&
								'label' in item,
						)
					)
				} catch {
					return false
				}
			}
			return true
		},
		{
			message:
				'Options must be a valid JSON array with objects containing "value" and "label" keys.',
			path: ['options'],
		},
	)
	.refine(
		(data) => {
			// Options should not be provided for this attribute type.
			if (data.type !== 'select' && data.type !== 'multiselect') {
				return !data.options || data.options.trim() === ''
			}
			return true
		},
		{
			message: 'Options should not be provided for this attribute type.',
			path: ['options'],
		},
	)
	.refine(
		(data) => {
			// Invalid JSON format for validation rules.
			if (data.validation_rules && data.validation_rules.trim() !== '') {
				try {
					JSON.parse(data.validation_rules)
					return true
				} catch {
					return false
				}
			}
			return true
		},
		{
			message: 'Invalid JSON format for validation rules.',
			path: ['validation_rules'],
		},
	)
	.refine(
		(data) => {
			// Invalid default value for the selected type.
			if (data.default_value && data.default_value.trim() !== '') {
				if (data.type === 'number') {
					return !isNaN(Number(data.default_value))
				} else if (data.type === 'boolean') {
					const lowerVal = data.default_value.toLowerCase()
					return lowerVal === 'true' || lowerVal === 'false'
				} else if (data.type === 'json') {
					try {
						JSON.parse(data.default_value)
						return true
					} catch {
						return false
					}
				} else if (data.type === 'date' || data.type === 'datetime') {
					const dateValue = new Date(data.default_value)
					return !isNaN(dateValue.getTime())
				}
			}
			return true
		},
		{
			message: 'Invalid default value for the selected type.',
			path: ['default_value'],
		},
	)

export type ProductAttributeCreateFormData = z.infer<
	typeof productAttributeCreateSchema
>

import { ProductAttribute } from '@/types/product' // Adjust path as needed
// import { FieldValues } from 'react-hook-form'

/**
 * Creates a dynamic validation rule function for react-hook-form based on ProductAttribute definition.
 * This function will be used in the 'validate' property of react-hook-form's rules.
 *
 * @param attr The ProductAttribute definition (from the attribute set).
 * @returns A function that takes the field value and returns true if valid, or an error message string if invalid.
 */
export const createDynamicAttributeValidationRule = (
	attr: ProductAttribute,
) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return (value: any): true | string => {
		if (
			!attr.is_required &&
			(value === null ||
				value === undefined ||
				(typeof value === 'string' && value.trim() === '') ||
				(Array.isArray(value) && value.length === 0))
		) {
			return true
		}

		if (
			attr.is_required &&
			(value === null ||
				value === undefined ||
				(typeof value === 'string' && value.trim() === '') ||
				(Array.isArray(value) && value.length === 0))
		) {
			return `${attr.name} is required.`
		}

		if (attr.type === 'number') {
			const numValue = parseFloat(value)
			if (isNaN(numValue)) {
				return `${attr.name} must be a valid number.`
			}
			if (
				attr.validation_rules?.min !== undefined &&
				numValue < attr.validation_rules.min
			) {
				return `${attr.name} must be at least ${attr.validation_rules.min}.`
			}
			if (
				attr.validation_rules?.max !== undefined &&
				numValue > attr.validation_rules.max
			) {
				return `${attr.name} cannot exceed ${attr.validation_rules.max}.`
			}
		} else if (attr.type === 'boolean') {
			if (typeof value !== 'boolean') {
				return `${attr.name} must be a boolean (true/false).`
			}
		} else if (attr.type === 'json') {
			if (typeof value !== 'string') {
				return `${attr.name} must be valid JSON string.`
			}
			try {
				JSON.parse(value)
			} catch (e: unknown) {
				if (e instanceof Error) {
					return `${attr.name} must be valid JSON.`
				}
			}
		} else if (attr.type === 'date' || attr.type === 'datetime') {
			const dateRegex = /^\d{4}-\d{2}-\d{2}$/
			const datetimeRegex =
				/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d{3})?Z?$/
			if (
				typeof value !== 'string' ||
				(attr.type === 'date' && !dateRegex.test(value)) ||
				(attr.type === 'datetime' && !datetimeRegex.test(value))
			) {
				return `${attr.name} must be a valid ${attr.type} format.`
			}
		} else if (attr.type in ['text', 'textarea']) {
			if (typeof value !== 'string') {
				return `${attr.name} must be a string.`
			}
			if (
				attr.validation_rules?.min_length !== undefined &&
				value.length < attr.validation_rules.min_length
			) {
				return `${attr.name} must be at least ${attr.validation_rules.min_length} characters long.`
			}
			if (
				attr.validation_rules?.max_length !== undefined &&
				value.length > attr.validation_rules.max_length
			) {
				return `${attr.name} cannot exceed ${attr.validation_rules.max_length} characters.`
			}
			if (attr.validation_rules?.pattern !== undefined) {
				try {
					const regex = new RegExp(attr.validation_rules.pattern)
					if (!regex.test(value)) {
						return `${attr.name} does not match the required pattern.`
					}
				} catch (e) {
					console.error(
						'Invalid regex pattern in attribute validation rules:',
						attr.validation_rules.pattern,
						e,
					)
					return true
				}
			}
		} else if (attr.type === 'select' || attr.type === 'multiselect') {
			const allowedValues = attr.options?.map((o) => o.value) || []
			if (attr.type === 'select') {
				if (!allowedValues.includes(value)) {
					return `${attr.name} has an invalid selection.`
				}
			} else if (attr.type === 'multiselect') {
				if (!Array.isArray(value)) {
					return `${attr.name} must be a list of selections.`
				}
				if (!value.every((item) => allowedValues.includes(item))) {
					return `${attr.name} contains one or more invalid selections.`
				}
			}
		}

		return true
	}
}

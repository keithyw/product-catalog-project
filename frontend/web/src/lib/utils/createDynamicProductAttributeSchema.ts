import { z } from 'zod'
import { ProductAttribute, ProductAttributeType } from '@/types/product'

/**
 * Dynamically creates a Zod schema for the 'attributes_data' object
 * based on the provided ProductAttribute definitions.
 *
 * This schema will validate the structure and values of each dynamic attribute.
 *
 * @param attributes An array of ProductAttribute objects defining the expected attributes.
 * @returns A ZodObject schema for the attributes_data.
 */
export const createDynamicProductAttributeSchema = (
	attributes: ProductAttribute[],
) => {
	const dynamicSchemaFields: Record<string, z.ZodTypeAny> = {}

	attributes.forEach((attr) => {
		let currentSchema: z.ZodTypeAny

		switch (attr.type as ProductAttributeType) {
			case 'text':
			case 'textarea':
			case 'json':
				let textSchema: z.ZodString = z.string()
				if (attr.validation_rules?.min_length !== undefined) {
					textSchema = textSchema.min(
						attr.validation_rules.min_length,
						`${attr.name} must be at least ${attr.validation_rules.min_length} characters.`,
					)
				}
				if (attr.validation_rules?.max_length !== undefined) {
					textSchema = textSchema.max(
						attr.validation_rules.max_length,
						`${attr.name} cannot exceed ${attr.validation_rules.max_length} characters.`,
					)
				}
				if (attr.validation_rules?.pattern !== undefined) {
					try {
						const regex = new RegExp(attr.validation_rules.pattern)
						textSchema = textSchema.regex(
							regex,
							`${attr.name} format is invalid.`,
						)
					} catch (e) {
						console.error(
							`Invalid regex pattern for attribute ${attr.code}: ${attr.validation_rules.pattern}`,
							e,
						)
					}
				}
				if (attr.type === 'json') {
					textSchema = textSchema.refine((val) => {
						try {
							JSON.parse(val)
							return true
						} catch {
							return false
						}
					}, `${attr.name} must be valid JSON.`)
				}
				currentSchema = textSchema
				break

			case 'number':
				let numberSchema: z.ZodNumber = z.coerce.number()
				if (attr.validation_rules?.min !== undefined) {
					numberSchema = numberSchema.min(
						attr.validation_rules.min,
						`${attr.name} must be at least ${attr.validation_rules.min}.`,
					)
				}
				if (attr.validation_rules?.max !== undefined) {
					numberSchema = numberSchema.max(
						attr.validation_rules.max,
						`${attr.name} cannot exceed ${attr.validation_rules.max}.`,
					)
				}
				currentSchema = numberSchema
				break

			case 'boolean':
				currentSchema = z.boolean()
				break

			case 'select':
				const selectOptions = attr.options?.map((o) => o.value) || []
				currentSchema = z.union(selectOptions.map((val) => z.literal(val)))
				break

			case 'multiselect':
				const multiSelectOptions = attr.options?.map((o) => o.value) || []
				currentSchema = z.array(
					z.union(multiSelectOptions.map((val) => z.literal(val))),
				)
				break

			case 'date':
				currentSchema = z.string().refine((val) => {
					return (
						!isNaN(new Date(val).getTime()) && val.match(/^\d{4}-\d{2}-\d{2}$/)
					)
				}, `${attr.name} must be a valid date (YYYY-MM-DD).`)
				break

			case 'datetime':
				currentSchema = z.string().refine((val) => {
					return !isNaN(new Date(val).getTime())
				}, `${attr.name} must be a valid datetime string.`)
				break

			default:
				currentSchema = z.any()
				break
		}

		dynamicSchemaFields[attr.code] = attr.is_required
			? currentSchema
			: currentSchema.nullable().optional()
	})

	return z.object(dynamicSchemaFields)
}

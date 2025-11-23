import React, { Fragment, useEffect, useMemo, useState } from 'react'
import { Controller, FieldError, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import ComboboxSingleSelect from '@/components/ui/form/ComboboxSingleSelect'
import productAttributeSetService from '@/lib/services/productAttributeSet'
import { createDynamicProductAttributeSchema } from '@/lib/utils/createDynamicProductAttributeSchema'
import {
	attributesDataSchema,
	AttributesDataFormData,
} from '@/schemas/productSchema'
import useInventoryStore from '@/stores/useInventoryStore'
import { OptionType } from '@/types/form'
import { ProductAttribute } from '@/types/product'
import { StepComponentProps } from '@/types/wizard'

// type AttributeDataForm = {
// 	attributes: Record<string, string | number | null>
// }

type AttributeSetRequest = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	attributes_data?: Record<string, any> | null
}

const ChooseProductAttributesStep = ({
	setSubmitHandler,
}: StepComponentProps) => {
	const {
		inventoryItem,
		product,
		setInventoryItem,
		setIsCurrentStepValid,
		setIsSubmitting,
	} = useInventoryStore()
	const [productAttributes, setProductAttributes] = useState<
		ProductAttribute[]
	>([])

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [schema, setSchema] = useState<z.ZodObject<any> | null>(null)

	const {
		control,
		formState: { errors, isValid, isSubmitting },
		handleSubmit,
	} = useForm<AttributeSetRequest>({
		resolver: (values, context, options) => {
			if (!schema) {
				return zodResolver(attributesDataSchema)(values, context, options)
			}
			const dynSchema = z.object({
				attributes_data: schema.nullable().optional(),
			})
			return zodResolver(dynSchema)(values, context, options)
		},
		mode: 'onChange',
	})

	useEffect(() => {
		setIsCurrentStepValid(isValid)
		setIsSubmitting(isSubmitting)
	}, [isValid, isSubmitting, setIsCurrentStepValid, setIsSubmitting])

	useEffect(() => {
		const fetchAttributeSets = async () => {
			if (!product) {
				return
			}
			try {
				const res = await productAttributeSetService.get(product.attribute_set)
				if (!res) {
					// also need to allow user to skip this step
					// either that or i place this code into the previous step and increment the
					// current step; either way, i need a skip step button
					setIsCurrentStepValid(true)
					return
				}
				const items = res.attributes_detail.filter(
					(a) =>
						['select', 'multiselect'].includes(a.type) &&
						!!product?.attributes_data?.[a.name],
				)
				setIsCurrentStepValid(items.length === 0)
				setProductAttributes(items)
				const dynamicSchema = createDynamicProductAttributeSchema(items)
				setSchema(dynamicSchema)
			} catch (error) {
				console.error(error)
			}
		}
		fetchAttributeSets()
	}, [product, setIsCurrentStepValid, setProductAttributes])

	useEffect(() => {
		const handleStepSubmit = async (): Promise<boolean> => {
			return true
		}
		setSubmitHandler(handleStepSubmit)
		return () => {
			setSubmitHandler(null)
		}
	}, [handleSubmit, inventoryItem, setInventoryItem, setSubmitHandler])

	const attributeOptions = useMemo(() => {
		if (!product || productAttributes.length === 0) {
			return {}
		}
		const options: Record<string, OptionType[]> = {}
		productAttributes.forEach((a) => {
			options[a.name] =
				product?.attributes_data?.[a.name]?.map((v: string) => ({
					value: v,
					label: v,
				})) || []
		})
		return options
	}, [product, productAttributes])

	const handleSelect = (key: string, value: string | number | null) => {
		const oldAttributesData = inventoryItem?.attributes_data || {}
		const newAttributesData = {
			...oldAttributesData,
			[key]: value,
		}
		setInventoryItem({
			...inventoryItem,
			attributes_data: newAttributesData,
		})
		const allAttributesSelected = Object.values(
			inventoryItem?.attributes_data || {},
		).every((v) => v !== null)
		setIsCurrentStepValid(
			allAttributesSelected &&
				Object.keys(newAttributesData).length === productAttributes.length,
		)
	}

	// should pull this into a utility file
	const getNestedErrorMessage = (code: string): string | undefined => {
		const error = errors.attributes_data?.[code] as FieldError | undefined
		return error?.message
	}

	return (
		<div className='space-y-4'>
			{productAttributes.length > 0 ? (
				<>
					<h1 className='text-2xl font-bold mb-6 text-gray-800'>
						Choose Product Attributes to Configure
					</h1>
					{productAttributes.map((a) => {
						const fieldName =
							`attributes_data.${a.name}` as keyof AttributesDataFormData
						return (
							<Fragment key={a.name}>
								<Controller
									name={fieldName}
									control={control}
									render={({ field }) => (
										<ComboboxSingleSelect
											id={a.name}
											label={a.display_name}
											// options should be the values of the attribute
											options={attributeOptions[a.name]}
											selectedValue={
												(field.value as string | number | null) || null
											}
											onSelect={(v) => {
												field.onChange(v)
												handleSelect(a.name, v)
											}}
											placeholder={`Select ${a.display_name}`}
											errorMessage={getNestedErrorMessage(a.name)}
										/>
									)}
								/>
							</Fragment>
						)
					})}
				</>
			) : (
				<p className='text-red-500'>
					No attributes found. Hit Next to continue.
				</p>
			)}
		</div>
	)
}

export default ChooseProductAttributesStep

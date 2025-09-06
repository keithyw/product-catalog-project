import React, { Fragment, useEffect, useState } from 'react'
import { Controller, FieldError, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import ComboboxMultiSelect from '@/components/ui/form/ComboboxMultiSelect'
import FormInput from '@/components/ui/form/FormInput'
import productService from '@/lib/services/product'
import productAttributeSetService from '@/lib/services/productAttributeSet'
import { createDynamicProductAttributeSchema } from '@/lib/utils/createDynamicProductAttributeSchema'
import { handleFormErrors } from '@/lib/utils/errorHandler'
import {
	attributesDataSchema,
	AttributesDataFormData,
} from '@/schemas/productSchema'
import useProductStore from '@/stores/useProductStore'
import {
	CreateProductRequest,
	ProductAttribute,
	ProductAttributeType,
} from '@/types/product'
import { StepComponentProps } from '@/types/wizard'

type AttributeSetRequest = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	attributes_data?: Record<string, any> | null
}

const AttributeSetStep: React.FC<StepComponentProps> = ({
	setSubmitHandler,
}) => {
	const {
		isEditMode,
		product,
		setProduct,
		setIsCurrentStepValid,
		setIsEditMode,
		setIsSubmitting,
	} = useProductStore()
	const selectedAttributeSetId = product?.attribute_set
	const [fields, setFields] = useState<ProductAttribute[]>([])
	const [isLoadingAttributes, setIsLoadingAttributes] = useState(false)
	const [errorAttributes, setErrorAttributes] = useState<string | null>(null)

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [schema, setSchema] = useState<z.ZodObject<any> | null>(null)

	const {
		control,
		register,
		setError,
		formState: { errors, isValid, isSubmitting },
		handleSubmit,
		getValues,
		setValue,
		trigger,
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
		defaultValues: {
			attributes_data: product?.attributes_data || {},
		},
		mode: 'onChange',
	})

	useEffect(() => {
		setIsCurrentStepValid(isValid)
		setIsSubmitting(isSubmitting)
	}, [isSubmitting, isValid, setIsCurrentStepValid, setIsSubmitting])

	useEffect(() => {
		const fetchAttributes = async () => {
			setErrorAttributes(null)
			if (
				selectedAttributeSetId === null ||
				selectedAttributeSetId === undefined
			) {
				setFields([])
				setIsLoadingAttributes(false)
				setSchema(null)
				return
			}
			setIsLoadingAttributes(true)
			try {
				const attributeSet = await productAttributeSetService.get(
					selectedAttributeSetId,
				)
				const currentAttributesData = getValues('attributes_data') || {}
				const fields = attributeSet.attributes_detail || []
				setFields(fields)
				const dynamicSchema = createDynamicProductAttributeSchema(fields)
				setSchema(dynamicSchema)

				if (!isEditMode) {
					const newAttributesData = { ...currentAttributesData }
					attributeSet.attributes_detail.forEach((attr) => {
						if (
							attr.default_value !== null &&
							attr !== undefined &&
							!(attr.code in newAttributesData)
						) {
							newAttributesData[attr.code] = attr.default_value
						}
					})
					setValue('attributes_data', newAttributesData)
				} else {
					const newAttributesData = { ...currentAttributesData }
					fields.forEach((f) => {
						if (currentAttributesData[f.name]) {
							if (
								['select', 'multiselect'].includes(f.type) &&
								typeof currentAttributesData[f.name] === 'string'
							) {
								newAttributesData[f.code] = JSON.parse(
									currentAttributesData[f.name],
								)
							} else {
								newAttributesData[f.code] = currentAttributesData[f.name]
							}
						}
					})
					setValue('attributes_data', newAttributesData)
				}
			} catch (e: unknown) {
				if (e instanceof Error) {
					setErrorAttributes(e.message)
					toast.error(e.message)
					setSchema(null)
				}
			} finally {
				setIsLoadingAttributes(false)
			}
		}
		fetchAttributes()
	}, [getValues, isEditMode, setError, setValue, selectedAttributeSetId])

	useEffect(() => {
		const handleStepSubmit = async (): Promise<boolean> => {
			setIsSubmitting(true)
			const isFormValid = await trigger()
			if (!product || !isFormValid) {
				setIsSubmitting(false)
				return false
			}
			return await handleSubmit(async (data) => {
				const partial: Partial<CreateProductRequest> = {
					attributes_data: data.attributes_data,
				}
				try {
					const res = await productService.patch(parseInt(product.id), partial)
					setProduct(res)
					setIsEditMode(false)
					toast.success(`Product ${res.name} attributes updated`)
				} catch (e: unknown) {
					handleFormErrors(e, setError, 'Failed to update attributes.')
				} finally {
					setIsSubmitting(false)
					return
				}
				return false
			})()
				.then(() => true)
				.catch(() => false)
		}
		setSubmitHandler(handleStepSubmit)
		return () => {
			setSubmitHandler(null)
		}
	}, [
		handleSubmit,
		isValid,
		product,
		setError,
		setProduct,
		setIsEditMode,
		setIsSubmitting,
		setSubmitHandler,
		trigger,
	])

	if (isLoadingAttributes) {
		return (
			<div className='text-center text-gray-600'>Loading attributes...</div>
		)
	}

	if (errorAttributes) {
		return <div className='text-center text-red-600'>{errorAttributes}</div>
	}

	if (selectedAttributeSetId === null || selectedAttributeSetId === undefined) {
		return (
			<div className='text-center text-gray-600'>Select an attribute set</div>
		)
	}

	if (fields.length === 0) {
		return <div className='text-center text-gray-600'>No attributes found</div>
	}

	const getNestedErrorMessage = (code: string): string | undefined => {
		const error = errors.attributes_data?.[code] as FieldError | undefined
		return error?.message
	}

	return (
		<div className='space-y-4'>
			<h2 className='text-xl font-bold text-gray-800 mb-4'>Attributes Setup</h2>
			{fields.map((attr) => {
				const fieldName =
					`attributes_data.${attr.code}` as keyof AttributesDataFormData
				return (
					<Fragment key={attr.id}>
						{attr.type === 'multiselect' ? (
							<Controller
								name={fieldName}
								control={control}
								render={({ field }) => (
									<ComboboxMultiSelect
										id={attr.code}
										label={attr.name}
										options={
											attr.options?.map((o) => ({
												value: o.value,
												label: o.label,
											})) || []
										}
										selectedValues={(field.value as (string | number)[]) || []}
										onSelect={(selectedIds) => field.onChange(selectedIds)}
										placeholder={`Select ${attr.name}`}
										errorMessage={getNestedErrorMessage(attr.code)}
									/>
								)}
							/>
						) : (
							<Controller
								name={fieldName}
								control={control}
								render={({ field }) => (
									<FormInput
										field={{
											name: fieldName, // TODO: replace `any` with Path<ProductCreateFormData>
											label: attr.name,
											placeholder: `Enter ${attr.name} value`,
											required: attr.is_required,
											type: attr.type as ProductAttributeType,
										}}
										value={field.value}
										onChange={field.onChange}
										onBlur={field.onBlur}
										register={register}
										control={control}
										errorMessage={getNestedErrorMessage(attr.code)}
									/>
								)}
							/>
						)}
					</Fragment>
				)
			})}
		</div>
	)
}

export default AttributeSetStep

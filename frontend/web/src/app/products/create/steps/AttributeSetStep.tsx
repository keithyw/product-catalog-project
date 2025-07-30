import React, { Fragment, useEffect, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import toast from 'react-hot-toast'
import ComboboxMultiSelect from '@/components/ui/form/ComboboxMultiSelect'
import FormInput from '@/components/ui/form/FormInput'
import productAttributeSetService from '@/lib/services/productAttributeSet'
import { ProductCreateFormData } from '@/schemas/productSchema'
import useProductStore from '@/stores/useProductStore'
import {
	ProductAttribute,
	// ProductAttributeSet,
	ProductAttributeType,
} from '@/types/product'

const AttributeSetStep: React.FC = () => {
	const { product } = useProductStore()
	const selectedAttributeSetId = product?.attribute_set
	const [fields, setFields] = useState<ProductAttribute[]>([])
	const [isLoadingAttributes, setIsLoadingAttributes] = useState(false)
	const [errorAttributes, setErrorAttributes] = useState<string | null>(null)

	const {
		control,
		register,
		setError,
		formState: { errors },
		getValues,
		setValue,
	} = useFormContext<ProductCreateFormData>()

	useEffect(() => {
		const fetchAttributes = async () => {
			setErrorAttributes(null)
			if (
				selectedAttributeSetId === null ||
				selectedAttributeSetId === undefined
			) {
				setFields([])
				setIsLoadingAttributes(false)
				return
			}
			setIsLoadingAttributes(true)
			try {
				const attributeSet = await productAttributeSetService.get(
					selectedAttributeSetId,
				)
				setFields(attributeSet.attributes_detail || [])
				const currentAttributesData = getValues('attributes_data') || {}
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
			} catch (e: unknown) {
				if (e instanceof Error) {
					setErrorAttributes(e.message)
					toast.error(e.message)
				}
			} finally {
				setIsLoadingAttributes(false)
			}
		}
		fetchAttributes()
	}, [getValues, setError, setValue, selectedAttributeSetId])

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

	return (
		<div className='space-y-4'>
			<h2 className='text-xl font-bold text-gray-800 mb-4'>Attributes Setup</h2>
			{fields.map((attr) => (
				<Fragment key={attr.id}>
					{attr.type === 'multiselect' ? (
						<Controller
							name={`attributes_data.${attr.code}`}
							control={control}
							rules={{ required: attr.is_required }}
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
									errorMessage={
										errors.attributes_data?.[attr.code]?.message as string
									}
								/>
							)}
						/>
					) : (
						<FormInput
							field={{
								name: `attributes_data.${attr.code}`,
								label: attr.name,
								placeholder: `Enter ${attr.name} value`,
								required: attr.is_required,
								type: attr.type as ProductAttributeType,
							}}
							register={register}
							control={control}
							errorMessage={
								errors.attributes_data?.[attr.code]?.message as string
							}
						/>
					)}
				</Fragment>
			))}
		</div>
	)
}

export default AttributeSetStep

'use client'

import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import PermissionGuard from '@/components/auth/PermissionGuard'
import CreateFormLayout from '@/components/layout/CreateFormLayout'
import ComboboxSingleSelect from '@/components/ui/form/ComboboxSingleSelect'
import FormInput from '@/components/ui/form/FormInput'
import { PRODUCT_PERMISSIONS, PRICING_MODIFIERS_URL } from '@/lib/constants'
import categoryService from '@/lib/services/category'
import priceModifiersService from '@/lib/services/priceModifiers'
import productAttributeSetService from '@/lib/services/productAttributeSet'
import { handleFormErrors } from '@/lib/utils/errorHandler'
import {
	priceModifierCreateSchema,
	PriceModifierCreateFormData,
} from '@/schemas/priceModifierSchema'
import { FormField, OptionType } from '@/types/form'
import {
	PRICE_MODIFIER_TYPES,
	CreatePriceModifierRequest,
	ProductAttributeSet,
} from '@/types/product'

const fields: FormField<PriceModifierCreateFormData>[] = [
	{
		name: 'name',
		label: 'Name',
		placeholder: 'Enter modifier name',
		required: true,
	},
	{
		name: 'description',
		label: 'Description',
		placeholder: 'Enter modifier description',
		required: false,
		type: 'textarea',
	},
	{
		name: 'amount',
		label: 'Amount',
		placeholder: 'Enter modifier amount',
		required: true,
	},
	{
		name: 'type',
		label: 'Type',
		placeholder: 'Select a type',
		required: true,
		type: 'select',
		options: PRICE_MODIFIER_TYPES,
	},
	{
		name: 'priority',
		label: 'Priority',
		placeholder: 'Enter modifier priority',
		required: true,
		type: 'number',
	},
]

const CreatePriceModifierPage = () => {
	const router = useRouter()
	const [categories, setCategories] = useState<OptionType[]>([])
	const [isLoadingCategories, setIsLoadingCategories] = useState(true)
	const [errorCategories, setErrorCategories] = useState<string | null>(null)
	const [attributeSets, setAttributeSets] = useState<ProductAttributeSet[]>([])
	const [attributeSetOptions, setAttributeSetOptions] = useState<OptionType[]>(
		[],
	)
	const [isLoadingAttributeSets, setIsLoadingAttributeSets] = useState(true)
	const [errorAttributeSets, setErrorAttributeSets] = useState<string | null>(
		null,
	)
	const [attributes, setAttributes] = useState<OptionType[]>([])
	const [attributeValues, setAttributeValues] = useState<OptionType[]>([])

	const {
		register,
		control,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
		reset,
		watch,
	} = useForm<PriceModifierCreateFormData>({
		resolver: zodResolver(priceModifierCreateSchema),
		defaultValues: {
			name: '',
			description: '',
			amount: '',
			category: null,
			product_attribute: null,
			product_attribute_value: null,
			product_attribute_set: null,
			type: '',
			priority: 1,
		},
	})

	const watchedProductAttributeSet = watch('product_attribute_set')
	const watchedProductAttribute = watch('product_attribute')

	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoadingCategories(true)
				const categories = await categoryService.fetch(1, 200)
				if (categories.count > 0) {
					setCategories(
						categories.results.map((c) => ({ value: c.id, label: c.name })),
					)
				}
			} catch (e: unknown) {
				if (e instanceof Error) {
					setErrorCategories(e.message)
					console.error(e.message)
				}
			} finally {
				setIsLoadingCategories(false)
			}
			try {
				setIsLoadingAttributeSets(true)
				const attributeSets = await productAttributeSetService.fetch(1, 200)
				if (attributeSets.count > 0) {
					setAttributeSets(attributeSets.results)
					setAttributeSetOptions(
						attributeSets.results.map((as) => ({
							value: as.id,
							label: as.name,
						})),
					)
				}
			} catch (e: unknown) {
				if (e instanceof Error) {
					setErrorAttributeSets(e.message)
					console.error(e.message)
				}
			} finally {
				setIsLoadingAttributeSets(false)
			}
		}
		fetchData()
	}, [])

	useEffect(() => {
		if (watchedProductAttributeSet) {
			const attributeSet = attributeSets.find(
				(as) => as.id === watchedProductAttributeSet,
			)
			const attributesDetail = attributeSet?.attributes_detail || []
			setAttributes(
				attributesDetail
					.filter((attribute) =>
						['select', 'multiselect'].includes(attribute.type),
					)
					.map((a) => ({ value: a.id, label: a.name })),
			)
		} else {
			setAttributes([])
		}
	}, [attributeSets, watchedProductAttributeSet])

	useEffect(() => {
		if (watchedProductAttributeSet && watchedProductAttribute) {
			const attributeSet = attributeSets.find(
				(as) => as.id === watchedProductAttributeSet,
			)
			const attribute = attributeSet?.attributes_detail.find(
				(a) => a.id === watchedProductAttribute,
			)
			if (attribute) {
				setAttributeValues(
					attribute.options?.map((o) => ({ value: o.value, label: o.label })) ||
						[],
				)
			} else {
				setAttributeValues([])
			}
		}
	}, [
		attributes,
		attributeSets,
		watchedProductAttributeSet,
		watchedProductAttribute,
	])

	const onSubmit = async (data: PriceModifierCreateFormData) => {
		const req: CreatePriceModifierRequest = {
			name: data.name,
			description: data.description,
			amount: parseFloat(data.amount),
			category: data.category,
			product_attribute_set: data.product_attribute_set,
			product_attribute: data.product_attribute,
			product_attribute_value: data.product_attribute_value,
			type: data.type,
			priority: data.priority as number,
			is_active: true,
		}
		try {
			const res = await priceModifiersService.create(req)
			toast.success(`Price Modifier ${res.name} created successfully!`)
			reset()
			router.push(PRICING_MODIFIERS_URL)
		} catch (e: unknown) {
			handleFormErrors<PriceModifierCreateFormData>(
				e,
				setError,
				'Failed to create price modifier. Please review your input.',
			)
		}
	}

	return (
		<PermissionGuard requiredPermission={PRODUCT_PERMISSIONS.ADD}>
			<CreateFormLayout
				title='Create New Price Modifier'
				isSubmitting={isSubmitting}
				submitText='Create'
				submittingText='Creating...'
				handleSubmit={handleSubmit(onSubmit)}
			>
				{fields.map((f, idx) => (
					<FormInput
						key={idx}
						field={f}
						register={register}
						control={control}
						errorMessage={errors[f.name]?.message as string}
					/>
				))}
				<Controller
					name='category'
					control={control}
					render={({ field }) => (
						<ComboboxSingleSelect
							id='category'
							label='Category'
							options={categories}
							selectedValue={field.value || null}
							onSelect={field.onChange}
							placeholder={
								isLoadingCategories
									? 'Loading categories...'
									: errorCategories || 'Select a category'
							}
							readOnly={isLoadingCategories || !!errorCategories}
							errorMessage={errors.category?.message as string}
						/>
					)}
				/>
				<Controller
					name='product_attribute_set'
					control={control}
					render={({ field }) => (
						<ComboboxSingleSelect
							id='attribute_set'
							label='Attribute Set'
							options={attributeSetOptions}
							selectedValue={field.value || null}
							onSelect={field.onChange}
							placeholder={
								isLoadingAttributeSets
									? 'Loading attribute sets...'
									: errorAttributeSets || 'Select an attribute set'
							}
							readOnly={isLoadingAttributeSets || !!errorAttributeSets}
							errorMessage={errors.product_attribute_set?.message as string}
						/>
					)}
				/>
				<Controller
					name='product_attribute'
					control={control}
					render={({ field }) => (
						<ComboboxSingleSelect
							id='attribute'
							label='Attribute'
							options={attributes}
							selectedValue={field.value || null}
							onSelect={field.onChange}
							placeholder='Select an attribute'
							errorMessage={errors.product_attribute?.message as string}
						/>
					)}
				/>
				<Controller
					name='product_attribute_value'
					control={control}
					render={({ field }) => (
						<ComboboxSingleSelect
							id='attribute_value'
							label='Attribute Value'
							options={attributeValues}
							selectedValue={field.value || null}
							onSelect={field.onChange}
							placeholder='Select an attribute value'
							errorMessage={errors.product_attribute_value?.message as string}
						/>
					)}
				/>
			</CreateFormLayout>
		</PermissionGuard>
	)
}

export default CreatePriceModifierPage

'use client'

import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useParams, useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import PermissionGuard from '@/components/auth/PermissionGuard'
import CreateFormLayout from '@/components/layout/CreateFormLayout'
import ComboboxSingleSelect from '@/components/ui/form/ComboboxSingleSelect'
import FormInput from '@/components/ui/form/FormInput'
import SpinnerSection from '@/components/ui/SpinnerSection'
import {
	FAILED_LOADING_PRICING_MODIFIERS_ERROR,
	PRICING_MODIFIERS_URL,
	PRODUCT_PERMISSIONS,
} from '@/lib/constants'
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
	PriceModifier,
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

const PricingModifiersEditPage = () => {
	const router = useRouter()
	const params = useParams()
	const pricingModifierId = params.id
	const [isLoading, setIsLoading] = useState(true)
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
	const [pricingModifier, setPricingModifier] = useState<PriceModifier | null>(
		null,
	)

	const {
		register,
		handleSubmit,
		setError,
		reset,
		control,
		formState: { errors, isSubmitting },
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
		if (!pricingModifierId) return

		const fetchData = async () => {
			setIsLoading(true)
			const lookupPromises = [
				categoryService.fetch(1, 200).catch((e) => {
					setErrorCategories(e.message)
					console.error('Categories load error:', e)
					return null
				}),
				productAttributeSetService.fetch(1, 200).catch((e) => {
					setErrorAttributeSets(e.message)
					console.error('Attribute Sets load error:', e)
					return null
				}),
			]

			const [categoriesResult, attributeSetsResult] =
				await Promise.all(lookupPromises)

			setIsLoadingCategories(false)
			setIsLoadingAttributeSets(false)
			let loadedCategories: OptionType[] = []
			if (categoriesResult && categoriesResult.count > 0) {
				loadedCategories = categoriesResult.results.map((c) => ({
					value: c.id,
					label: c.name,
				}))
				setCategories(loadedCategories)
			}
			let loadedAttributeSets: ProductAttributeSet[] = []
			if (attributeSetsResult && attributeSetsResult.count > 0) {
				loadedAttributeSets =
					attributeSetsResult.results as ProductAttributeSet[]
				setAttributeSets(loadedAttributeSets)
				setAttributeSetOptions(
					loadedAttributeSets.map((as) => ({ value: as.id, label: as.name })),
				)
			}
			try {
				const res = await priceModifiersService.get(
					parseInt(pricingModifierId as string),
				)
				setPricingModifier(res)
				let initialCategory: OptionType | null = null
				if (res.category) {
					initialCategory = {
						value: res.category,
						label: res.category_name || '',
					}
				}

				let initialAttributeSet: OptionType | null = null
				let initialAttribute: OptionType | null = null
				let initialAttributeValue: OptionType | null = null

				if (res.product_attribute_set) {
					initialAttributeSet = {
						value: res.product_attribute_set,
						label: res.product_attribute_set_name || '',
					}

					if (res.product_attribute) {
						initialAttribute = {
							value: res.product_attribute,
							label: res.product_attribute_name || '',
						}
						if (res.product_attribute_value) {
							const attributeSetDetail = loadedAttributeSets.find(
								(as) => as.id === res.product_attribute_set,
							)
							const attributeDetail =
								attributeSetDetail?.attributes_detail.find(
									(a) => a.id === res.product_attribute,
								)
							const option = attributeDetail?.options?.find(
								(o) => o.value === res.product_attribute_value,
							)
							initialAttributeValue = {
								value: res.product_attribute_value,
								label: option?.label || res.product_attribute_value,
							}
						}
					}
				}
				reset({
					name: res.name,
					description: res.description || '',
					amount: res.amount.toString(),
					type: res.type,
					priority: res.priority,
					category: parseInt(initialCategory?.value as string) || null,
					product_attribute_set:
						parseInt(initialAttributeSet?.value as string) || null,
					product_attribute:
						parseInt(initialAttribute?.value as string) || null,
					product_attribute_value:
						(initialAttributeValue?.value as string) || null,
				})
			} catch (e: unknown) {
				console.error(e)
				setError('root.serverError', {
					type: 'server',
					message: FAILED_LOADING_PRICING_MODIFIERS_ERROR,
				})
				toast.error(FAILED_LOADING_PRICING_MODIFIERS_ERROR)
				router.push(PRICING_MODIFIERS_URL)
			} finally {
				setIsLoading(false)
			}
		}
		fetchData()
	}, [pricingModifierId, reset, router, setError])

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
			const res = await priceModifiersService.patch(
				parseInt(pricingModifierId as string),
				req,
			)
			toast.success(`Price Modifier ${res.name} updated successfully!`)
			router.push(PRICING_MODIFIERS_URL)
		} catch (e: unknown) {
			handleFormErrors<PriceModifierCreateFormData>(
				e,
				setError,
				'Failed to create price modifier. Please review your input.',
			)
		}
	}

	if (isLoading) {
		return <SpinnerSection spinnerMessage='Loading...' />
	}

	if (!pricingModifier) {
		return <div className='text-center py-8'>Pricing Modifier not found</div>
	}

	return (
		<PermissionGuard requiredPermission={PRODUCT_PERMISSIONS.CHANGE}>
			<CreateFormLayout
				title='Edit Price Modifier'
				isSubmitting={isSubmitting}
				submitText='Save'
				submittingText='Saving...'
				cancelUrl={PRICING_MODIFIERS_URL}
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

export default PricingModifiersEditPage

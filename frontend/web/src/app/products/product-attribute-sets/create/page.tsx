'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import PermissionGuard from '@/components/auth/PermissionGuard'
import CreateFormLayout from '@/components/layout/CreateFormLayout'
import FormInput from '@/components/ui/form/FormInput'
import MultiSelectManager from '@/components/ui/MultiSelectManager'
import { PRODUCT_ATTRIBUTE_SETS_URL } from '@/lib/constants'
import { PRODUCT_ATTRIBUTE_SET_PERMISSIONS } from '@/lib/constants/permissions'
import { useMultiSelectModalController } from '@/lib/hooks/useMultiSelectModalController'
import brandService from '@/lib/services/brand'
import categoryService from '@/lib/services/category'
import productAttributeService from '@/lib/services/productAttribute'
import productAttributeSetService from '@/lib/services/productAttributeSet'
import { handleFormErrors } from '@/lib/utils/errorHandler'
import {
	productAttributeSetCreateSchema,
	ProductAttributeSetFormData,
} from '@/schemas/productAttributeSetSchema'
import { Brand } from '@/types/brand'
import { FormField, OptionType } from '@/types/form'
import {
	CreateProductAttributeSetRequest,
	ProductAttribute,
} from '@/types/product'

const fields: FormField<ProductAttributeSetFormData>[] = [
	{
		name: 'name',
		label: 'Attribute Set Name',
		placeholder: 'e.g., Book Attributes, Shirt Attributes',
		required: true,
		type: 'text',
	},
	{
		name: 'description',
		label: 'Description',
		placeholder: 'A brief description of this attribute set',
		required: false,
		type: 'textarea',
	},
	{
		name: 'is_active',
		label: 'Is Active?',
		required: false,
		type: 'checkbox',
	},
]

export default function CreateProductAttributeSetPage() {
	const router = useRouter()
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
		reset,
		control,
	} = useForm<ProductAttributeSetFormData>({
		resolver: zodResolver(productAttributeSetCreateSchema),
		defaultValues: {
			name: '',
			description: '',
			is_active: true,
			category: null,
			brand: null,
		},
	})

	const onBrandCallback = (updatedBrands: Brand[]) => {
		const ids = updatedBrands.map((b) => b.id)
		setProductTypeBrands(ids)
	}

	const {
		data: allAttributes,
		selectedData: selectedAttributes,
		loadingErrors: errorAttributes,
		isLoading: loadingAttributes,
		onSelectItem: onSelectAttribute,
		onRemoveItem: onRemoveAttribute,
	} = useMultiSelectModalController<ProductAttribute>({
		defaultPageSize: 200,
		fetchData: productAttributeService.fetch,
	})

	const {
		data: allBrands,
		selectedData: selectedBrands,
		loadingErrors: errorBrands,
		isLoading: loadingBrands,
		onSelectItem: onSelectBrand,
		onRemoveItem: onRemoveBrand,
	} = useMultiSelectModalController<Brand>({
		defaultPageSize: 200,
		fetchData: brandService.fetch,
		onSelectCallback: onBrandCallback,
	})

	const [categories, setCategories] = useState<OptionType[]>([])
	const [loadingCategories, setLoadingCategories] = useState(true)
	const [errorCategories, setErrorCategories] = useState<string | null>(null)
	const [brands, setBrands] = useState<OptionType[]>([])
	const [productTypeBrands, setProductTypeBrands] = useState<number[]>([])

	useEffect(() => {
		setBrands(allBrands.map((b) => ({ value: b.id, label: b.name })))
	}, [allBrands, setBrands])

	useEffect(() => {
		const fetchCategories = async () => {
			setLoadingCategories(true)
			setErrorCategories(null)
			try {
				const res = await categoryService.fetch()
				setCategories(res.results.map((c) => ({ value: c.id, label: c.name })))
			} catch (e: unknown) {
				if (e instanceof Error) {
					setErrorCategories(e.message)
					console.error(e.message)
				}
			} finally {
				setLoadingCategories(false)
			}
		}
		fetchCategories()
	}, [])

	const onSubmit = async (data: ProductAttributeSetFormData) => {
		try {
			const req: CreateProductAttributeSetRequest = {
				name: data.name,
				description: data.description,
				is_active: data.is_active,
				attributes: selectedAttributes.map((a) => parseInt(a.id as string)),
				category: data.category,
				brand: data.brand,
				product_type_brands: productTypeBrands,
			}
			const res = await productAttributeSetService.create(req)
			toast.success(`Attribute set ${res.name} created successfully!`)
			reset()
			router.push(PRODUCT_ATTRIBUTE_SETS_URL)
		} catch (e: unknown) {
			handleFormErrors<ProductAttributeSetFormData>(
				e,
				setError,
				'Failed to create attribute set. Please review your input.',
			)
		}
	}

	return (
		<PermissionGuard requiredPermission={PRODUCT_ATTRIBUTE_SET_PERMISSIONS.ADD}>
			<CreateFormLayout
				title='Create New Attribute Set'
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
				<MultiSelectManager
					title='Add Attributes'
					itemName='attributes'
					fieldName='name'
					data={allAttributes}
					isLoadingData={loadingAttributes}
					selectedData={selectedAttributes}
					loadingErrors={errorAttributes as string}
					onRemoveItem={onRemoveAttribute}
					onSelectItem={onSelectAttribute}
				/>

				<MultiSelectManager
					title='Add Allowable Brands'
					itemName='brands'
					fieldName='name'
					data={allBrands}
					isLoadingData={loadingBrands}
					selectedData={selectedBrands}
					loadingErrors={errorBrands as string}
					onRemoveItem={onRemoveBrand}
					onSelectItem={onSelectBrand}
				/>
				<FormInput
					field={{
						name: 'brand',
						label: 'Add brands (optional)',
						placeholder: loadingBrands
							? 'Loading brands...'
							: errorBrands || 'Select a brand',
						required: false,
						type: 'select',
						options: brands,
						readOnly: loadingBrands || !!errorBrands,
					}}
					register={register}
					control={control}
					errorMessage={errors.brand?.message as string}
				/>
				<FormInput
					field={{
						name: 'category',
						label: 'Add categories (optional)',
						placeholder: loadingCategories
							? 'Loading categories...'
							: errorCategories || 'Select a category',
						required: false,
						type: 'select',
						options: categories,
						readOnly: loadingCategories || !!errorCategories,
					}}
					register={register}
					control={control}
					errorMessage={errors.category?.message as string}
				/>
			</CreateFormLayout>
		</PermissionGuard>
	)
}

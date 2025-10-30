'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams, useRouter } from 'next/navigation'
import PermissionGuard from '@/components/auth/PermissionGuard'
import CreateFormLayout from '@/components/layout/CreateFormLayout'
import MultiSelectManager from '@/components/ui/MultiSelectManager'
import SpinnerSection from '@/components/ui/SpinnerSection'
import Button from '@/components/ui/form/Button'
import FormInput from '@/components/ui/form/FormInput'
import {
	FAILED_LOADING_PRODUCT_ATTRIBUTE_SET_ERROR,
	PRODUCT_ATTRIBUTE_SETS_URL,
} from '@/lib/constants'
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
	ProductAttributeSet,
} from '@/types/product'
import LookupFieldModal from '@/app/products/modals/LookupFieldModal'

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

export default function EditProductAttributeSetPage() {
	const router = useRouter()
	const params = useParams()
	const id = params.id
	const [isLoading, setIsLoading] = useState(true)
	const [attributeSet, setAttributeSet] = useState<ProductAttributeSet | null>(
		null,
	)
	const [isLookupFieldModalOpen, setIsLookupFieldModalOpen] = useState(false)

	const selectAttributeCallback = (updatedAttributes: ProductAttribute[]) => {
		setAttributeSet({
			...attributeSet!,
			attributes: updatedAttributes.map((a) => parseInt(a.id as string)),
		})
	}

	const {
		data: allAttributes,
		selectedData: selectedAttributes,
		setSelectedData: setSelectedAttributes,
		loadingErrors: errorAttributes,
		isLoading: loadingAttributes,
		onSelectItem: onSelectAttribute,
		onRemoveItem: onRemoveAttribute,
	} = useMultiSelectModalController<ProductAttribute>({
		defaultPageSize: 200,
		fetchData: productAttributeService.fetch,
		onSelectCallback: selectAttributeCallback,
	})

	const selectBrandCallback = (updatedBrands: Brand[]) => {
		const ids = updatedBrands.map((b) => b.id)
		setAttributeSet({
			...attributeSet!,
			product_type_brands: ids,
		})
	}

	const {
		data: allBrands,
		selectedData: selectedBrands,
		setSelectedData: setSelectedBrands,
		loadingErrors: errorBrands,
		isLoading: loadingBrands,
		onSelectItem: onSelectBrand,
		onRemoveItem: onRemoveBrand,
	} = useMultiSelectModalController<Brand>({
		defaultPageSize: 200,
		fetchData: brandService.fetch,
		onSelectCallback: selectBrandCallback,
	})

	const [brands, setBrands] = useState<OptionType[]>([])
	const [categories, setCategories] = useState<OptionType[]>([])
	const [loadingCategories, setLoadingCategories] = useState(true)
	const [errorCategories, setErrorCategories] = useState<string | null>(null)

	useEffect(() => {
		setBrands(allBrands.map((b) => ({ value: b.id, label: b.name })))
	}, [allBrands, setBrands])

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

	useEffect(() => {
		if (!id) {
			setIsLoading(false)
			setError('root.serverError', {
				type: 'server',
				message: FAILED_LOADING_PRODUCT_ATTRIBUTE_SET_ERROR,
			})
			return
		}
		const fetchSet = async () => {
			setIsLoading(true)
			try {
				const attr = await productAttributeSetService.get(
					parseInt(id as string),
				)
				setAttributeSet(attr)
				reset({
					name: attr.name,
					description: attr.description,
					is_active: attr.is_active,
					category: attr.category,
					brand: attr.brand,
				})
			} catch (e: unknown) {
				if (e instanceof Error) {
					console.error(e.message)
					setError('root.serverError', {
						type: 'server',
						message: FAILED_LOADING_PRODUCT_ATTRIBUTE_SET_ERROR,
					})
					toast.error(FAILED_LOADING_PRODUCT_ATTRIBUTE_SET_ERROR)
					router.push(PRODUCT_ATTRIBUTE_SETS_URL)
				}
			} finally {
				setIsLoading(false)
			}
		}
		fetchSet()
	}, [id, reset, router, setError])

	useEffect(() => {
		const associatedBrandIds = new Set(attributeSet?.product_type_brands || [])
		setSelectedBrands(allBrands.filter((b) => associatedBrandIds.has(b.id)))
		const associatedAttributeIds = new Set(attributeSet?.attributes || [])
		setSelectedAttributes(
			allAttributes.filter((a) =>
				associatedAttributeIds.has(parseInt(a.id as string)),
			),
		)
	}, [
		attributeSet,
		allAttributes,
		allBrands,
		setSelectedAttributes,
		setSelectedBrands,
	])

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

	const onUpdateLookupField = (lookupField: ProductAttribute[]) => {
		setAttributeSet({
			...attributeSet!,
			lookup_field: lookupField.map((f) => f.name),
		})
	}

	const onSubmit = async (data: ProductAttributeSetFormData) => {
		try {
			const req: CreateProductAttributeSetRequest = {
				name: data.name,
				description: data.description,
				is_active: data.is_active,
				attributes: selectedAttributes.map((a) => parseInt(a.id as string)),
				category: data.category,
				brand: data.brand,
				product_type_brands: attributeSet?.product_type_brands || [],
				lookup_field: attributeSet?.lookup_field || [],
			}
			const res = await productAttributeSetService.update(
				parseInt(id as string),
				req,
			)
			toast.success(`Product Attribute Set "${res.name}" updated successfully!`)
			router.push(`${PRODUCT_ATTRIBUTE_SETS_URL}/${id}`)
		} catch (e: unknown) {
			handleFormErrors(e, setError, 'Failed updating attribute set.')
		}
	}

	if (isLoading) {
		return <SpinnerSection spinnerMessage='Loading attribute set...' />
	}

	if (!attributeSet) {
		return <p className='text-center py-8'>Attribute set not found</p>
	}

	return (
		<PermissionGuard
			requiredPermission={PRODUCT_ATTRIBUTE_SET_PERMISSIONS.CHANGE}
		>
			<CreateFormLayout
				title='Edit Attribute Set'
				isSubmitting={isSubmitting}
				submitText='Update'
				submittingText='Updating...'
				handleSubmit={handleSubmit(onSubmit)}
				cancelUrl={`${PRODUCT_ATTRIBUTE_SETS_URL}/${id}`}
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
				{attributeSet.lookup_field?.length > 0 && (
					<div className='text-gray-900'>
						Lookup Field: {attributeSet?.lookup_field?.join(', ') || ''}
					</div>
				)}
				<Button
					actionType='neutral'
					type='button'
					onClick={() => setIsLookupFieldModalOpen(true)}
				>
					Add Lookup Field
				</Button>
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
						label: 'Add brand that own this set (optional)',
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
			<LookupFieldModal
				attributes={selectedAttributes}
				isOpen={isLookupFieldModalOpen}
				onClose={() => setIsLookupFieldModalOpen(false)}
				onUpdateLookupField={onUpdateLookupField}
			/>
		</PermissionGuard>
	)
}

'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams, useRouter } from 'next/navigation'
import PermissionGuard from '@/components/auth/PermissionGuard'
import CreateFormLayout from '@/components/layout/CreateFormLayout'
import ChipContainer from '@/components/ui/ChipContainer'
import SpinnerSection from '@/components/ui/SpinnerSection'
import Button from '@/components/ui/form/Button'
import FormInput from '@/components/ui/form/FormInput'
import MultiSelectModal from '@/components/ui/modals/MultiSelectModal'
import {
	FAILED_LOADING_PRODUCT_ATTRIBUTE_SET_ERROR,
	PRODUCT_ATTRIBUTE_SETS_URL,
} from '@/lib/constants'
import { PRODUCT_ATTRIBUTE_SET_PERMISSIONS } from '@/lib/constants/permissions'
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
	const [allAttributes, setAllAttributes] = useState<ProductAttribute[]>([])
	const [loadingAttributes, setLoadingAttributes] = useState(true)
	const [errorAttributes, setErrorAttributes] = useState<string | null>(null)

	const [categories, setCategories] = useState<OptionType[]>([])
	const [loadingCategories, setLoadingCategories] = useState(true)
	const [errorCategories, setErrorCategories] = useState<string | null>(null)

	const [brands, setBrands] = useState<OptionType[]>([])
	const [allBrands, setAllBrands] = useState<Brand[]>([])
	const [loadingBrands, setLoadingBrands] = useState(true)
	const [errorBrands, setErrorBrands] = useState<string | null>(null)

	const [selectedAttributes, setSelectedAttributes] = useState<
		ProductAttribute[]
	>([])
	const [selectedBrands, setSelectedBrands] = useState<Brand[]>([])

	const [isAttributesSelectionModalOpen, setIsAttributesSelectionModalOpen] =
		useState(false)
	const [isBrandsSelectionModalOpen, setIsBrandsSelectionModalOpen] =
		useState(false)

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

	const onClose = () => {
		setIsBrandsSelectionModalOpen(false)
	}

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
		const fetchAttributes = async () => {
			setLoadingAttributes(true)
			setErrorAttributes(null)
			try {
				const res = await productAttributeService.fetch(1, 200)
				setAllAttributes(res.results)
			} catch (e: unknown) {
				if (e instanceof Error) {
					setErrorAttributes(e.message)
					console.error(e.message)
				}
			} finally {
				setLoadingAttributes(false)
			}
		}
		fetchAttributes()
	}, [])

	useEffect(() => {
		const fetchBrands = async () => {
			setLoadingBrands(true)
			setErrorBrands(null)
			try {
				const res = await brandService.fetch(1, 200)
				setAllBrands(res.results)
				setBrands(res.results.map((b) => ({ value: b.id, label: b.name })))
			} catch (e: unknown) {
				if (e instanceof Error) {
					setErrorBrands(e.message)
					console.error(e.message)
				}
			} finally {
				setLoadingBrands(false)
			}
		}
		fetchBrands()
	}, [])

	useEffect(() => {
		const associatedBrandIds = new Set(attributeSet?.product_type_brands || [])
		setSelectedBrands(allBrands.filter((b) => associatedBrandIds.has(b.id)))
		const associatedAttributeIds = new Set(attributeSet?.attributes || [])
		setSelectedAttributes(
			allAttributes.filter((a) =>
				associatedAttributeIds.has(parseInt(a.id as string)),
			),
		)
	}, [attributeSet, allAttributes, allBrands])

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
				product_type_brands: attributeSet?.product_type_brands || [],
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

	const onSelectAttribute = (attribute: ProductAttribute) => {
		if (!selectedAttributes.find((a) => a.id === attribute.id)) {
			const newSelectedAttributes = [...selectedAttributes, attribute]
			setSelectedAttributes(newSelectedAttributes)
			setAttributeSet({
				...attributeSet!,
				attributes: newSelectedAttributes.map((a) => parseInt(a.id as string)),
			})
		}
	}

	const onRemoveAttribute = (attribute: ProductAttribute) => {
		setSelectedAttributes(
			selectedAttributes.filter((a) => a.id !== attribute.id),
		)
	}

	const onSelectBrand = (brand: Brand) => {
		if (!selectedBrands.find((b) => b.id === brand.id)) {
			const newSelectedBrands = [...selectedBrands, brand]
			const ids = newSelectedBrands.map((b) => b.id)
			setSelectedBrands(newSelectedBrands)
			setAttributeSet({
				...attributeSet!,
				product_type_brands: ids,
			})
		}
	}

	const onRemoveBrand = (brand: Brand) => {
		setSelectedBrands(selectedBrands.filter((b) => b.id !== brand.id))
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
				<div className='mt-4'>
					<h3 className='text-lg font-semibold text-gray-900'>Attributes</h3>
					<div className='relative mt-1'>
						<ChipContainer
							itemName='attributes'
							fieldName='name'
							isLoadingData={loadingAttributes}
							data={selectedAttributes}
							errors={errorAttributes as string}
							onRemove={onRemoveAttribute}
						/>
					</div>
					<div className='items-center space-x-2 mt-2'>
						<Button
							actionType='neutral'
							onClick={(e) => {
								e.preventDefault()
								setIsAttributesSelectionModalOpen(true)
							}}
						>
							Add Attributes
						</Button>
					</div>
					<MultiSelectModal
						title='Add Attributes Here'
						isOpen={isAttributesSelectionModalOpen}
						onClose={() => setIsAttributesSelectionModalOpen(false)}
						allItems={allAttributes}
						selectedItems={selectedAttributes}
						onSelectItem={onSelectAttribute}
					/>
				</div>
				<div className='mt-4'>
					<h3 className='text-lg font-semibold text-gray-900'>
						Allowable Brands
					</h3>
					<div className='relative mt-1'>
						<ChipContainer
							itemName='brands'
							fieldName='name'
							isLoadingData={loadingBrands}
							data={selectedBrands}
							errors={errorBrands as string}
							onRemove={onRemoveBrand}
						/>
					</div>
					<div className='items-center space-x-2 mt-2'>
						<Button
							actionType='neutral'
							onClick={(e) => {
								e.preventDefault()
								setIsBrandsSelectionModalOpen(true)
							}}
						>
							Add Allowable Brands
						</Button>
					</div>
					<MultiSelectModal
						title='Add Brands Here'
						isOpen={isBrandsSelectionModalOpen}
						onClose={onClose}
						allItems={allBrands}
						selectedItems={selectedBrands}
						onSelectItem={onSelectBrand}
					/>
				</div>
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
		</PermissionGuard>
	)
}

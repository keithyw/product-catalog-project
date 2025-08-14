'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { XMarkIcon } from '@heroicons/react/20/solid'
import Chip from '@/components/ui/Chip'
import PermissionGuard from '@/components/auth/PermissionGuard'
import CreateFormLayout from '@/components/layout/CreateFormLayout'
import Button from '@/components/ui/form/Button'
import FormInput from '@/components/ui/form/FormInput'
import MultiSelectModal from '@/components/ui/modals/MultiSelectModal'
import { PRODUCT_ATTRIBUTE_SETS_URL } from '@/lib/constants'
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

	const [productTypeBrands, setProductTypeBrands] = useState<number[]>([])
	const [selectedAttributes, setSelectedAttributes] = useState<
		ProductAttribute[]
	>([])
	const [selectedBrands, setSelectedBrands] = useState<Brand[]>([])
	const [isAttributesSelectionModalOpen, setIsAttributesSelectionModalOpen] =
		useState(false)
	const [isBrandsSelectionModalOpen, setIsBrandsSelectionModalOpen] =
		useState(false)

	const onClose = () => {
		setIsBrandsSelectionModalOpen(false)
	}

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

	const onSelectAttribute = (attribute: ProductAttribute) => {
		if (!selectedAttributes.find((a) => a.id === attribute.id)) {
			const newSelectedAttributes = [...selectedAttributes, attribute]
			setSelectedAttributes(newSelectedAttributes)
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
			setProductTypeBrands(ids)
		}
	}

	const onRemoveBrand = (brand: Brand) => {
		const newSelectedBrands = selectedBrands.filter((b) => b.id !== brand.id)
		const ids = newSelectedBrands.map((b) => b.id)
		setSelectedBrands(newSelectedBrands)
		setProductTypeBrands(ids)
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
				<div className='mt-4'>
					<h3 className='text-lg font-semibold text-gray-900'>Attributes</h3>
					<div className='relative mt-1'>
						<div className='relative w-full cursor-default border shadow-md rounded-lg'>
							<div className='flex flex-wrap gap-2 p-2'>
								{!loadingAttributes && selectedAttributes.length > 0 ? (
									selectedAttributes.map((a) => (
										<Chip key={a.id} chipType='primary'>
											{a.name}
											<button
												type='button'
												onClick={() => onRemoveAttribute(a)}
												className='ml-1 text-blue-600 hover:text-blue-900 focus:outline-none'
											>
												<XMarkIcon className='h-3 w-3' />
											</button>
										</Chip>
									))
								) : (
									<p className='text-gray-500'>
										No attributes selected. Click Add Attributes to select.
									</p>
								)}
								{errorAttributes && (
									<p className='text-red-500'>{errorAttributes}</p>
								)}
							</div>
						</div>
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
						<div className='relative w-full cursor-default border shadow-md rounded-lg'>
							<div className='flex flex-wrap gap-2 p-2'>
								{selectedBrands.length > 0 ? (
									selectedBrands.map((b) => (
										<Chip key={b.id} chipType='primary'>
											{b.name}
											<button
												type='button'
												onClick={() => onRemoveBrand(b)}
												className='ml-1 text-blue-600 hover:text-blue-900 focus:outline-none'
											>
												<XMarkIcon className='h-3 w-3' />
											</button>
										</Chip>
									))
								) : (
									<p className='text-gray-500'>
										No brands selected. Click Add Allowable Brands to select.
									</p>
								)}
							</div>
						</div>
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
						title='Add Allowable Brands'
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

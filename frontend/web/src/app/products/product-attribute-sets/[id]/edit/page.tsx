'use client'

import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams, useRouter } from 'next/navigation'
import { XMarkIcon } from '@heroicons/react/20/solid'
import PermissionGuard from '@/components/auth/PermissionGuard'
import CreateFormLayout from '@/components/layout/CreateFormLayout'
import Chip from '@/components/ui/Chip'
import SpinnerSection from '@/components/ui/SpinnerSection'
import Button from '@/components/ui/form/Button'
import ComboboxMultiSelect from '@/components/ui/form/ComboboxMultiSelect'
import FormInput from '@/components/ui/form/FormInput'
import BrandsSelectionModal from '@/components/ui/modals/BrandsSelectionModal'
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
	const [attributes, setAttributes] = useState<OptionType[]>([])
	const [loadingAttributes, setLoadingAttributes] = useState(true)
	const [errorAttributes, setErrorAttributes] = useState<string | null>(null)

	const [categories, setCategories] = useState<OptionType[]>([])
	const [loadingCategories, setLoadingCategories] = useState(true)
	const [errorCategories, setErrorCategories] = useState<string | null>(null)

	const [brands, setBrands] = useState<OptionType[]>([])
	const [allBrands, setAllBrands] = useState<Brand[]>([])
	const [loadingBrands, setLoadingBrands] = useState(true)
	const [errorBrands, setErrorBrands] = useState<string | null>(null)

	const [selectedBrands, setSelectedBrands] = useState<Brand[]>([])

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
			attributes: [],
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
					attributes: attr.attributes,
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
				const res = await productAttributeService.fetch()
				setAttributes(res.results.map((a) => ({ value: a.id, label: a.name })))
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
				const res = await brandService.fetch()
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
	}, [attributeSet, allBrands])

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
				attributes: data.attributes,
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
				<Controller
					name='attributes'
					control={control}
					rules={{ required: true }}
					render={({ field }) => (
						<ComboboxMultiSelect
							id='attributes'
							label='Select Attributes'
							options={attributes}
							selectedValues={(field.value as number[]) || []}
							onSelect={(selectedIds) => field.onChange(selectedIds)}
							placeholder={
								loadingAttributes
									? 'Loading attributes...'
									: errorAttributes || 'Select attributes for this set'
							}
							disabled={loadingAttributes || !!errorAttributes}
							errorMessage={errors.attributes?.message as string}
						/>
					)}
				/>
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
									<p>
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
					<BrandsSelectionModal
						isOpen={isBrandsSelectionModalOpen}
						onClose={onClose}
						allBrands={allBrands}
						selectedBrands={selectedBrands}
						onSelectBrand={onSelectBrand}
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

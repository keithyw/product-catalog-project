'use client'

import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams, useRouter } from 'next/navigation'
import PermissionGuard from '@/components/auth/PermissionGuard'
import CreateFormLayout from '@/components/layout/CreateFormLayout'
import SpinnerSection from '@/components/ui/SpinnerSection'
import ComboboxMultiSelect from '@/components/ui/form/ComboboxMultiSelect'
import FormInput from '@/components/ui/form/FormInput'
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
import { FormField, OptionType } from '@/types/form'
import { ProductAttributeSet } from '@/types/product'

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
	const [loadingBrands, setLoadingBrands] = useState(true)
	const [errorBrands, setErrorBrands] = useState<string | null>(null)

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
			const res = await productAttributeSetService.update(
				parseInt(id as string),
				data,
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

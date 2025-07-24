'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useParams, useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import PermissionGuard from '@/components/auth/PermissionGuard'
import CreateFormLayout from '@/components/layout/CreateFormLayout'
import SpinnerSection from '@/components/ui/SpinnerSection'
import FormInput from '@/components/ui/form/FormInput'
import {
	CATEGORIES_URL,
	FAILED_LOADING_CATEGORIES_ERROR,
} from '@/lib/constants'
import { CATEGORY_PERMISSIONS } from '@/lib/constants/permissions'
import categoryService from '@/lib/services/category'
import categorySystemService from '@/lib/services/categorySystem'
import { handleFormErrors } from '@/lib/utils/errorHandler'
import {
	categoryCreateSchema,
	CategoryCreateFormData,
} from '@/schemas/categorySchema'
import { Category } from '@/types/category'
import { FormField, OptionType } from '@/types/form'

const fields: FormField<CategoryCreateFormData>[] = [
	{
		name: 'name',
		label: 'Category Name',
		placeholder: 'Enter category name',
		required: true,
	},
	{
		name: 'description',
		label: 'Description',
		placeholder: 'Enter description',
		required: false,
		type: 'textarea',
	},
	{
		name: 'image_url',
		label: 'Image URL',
		placeholder: 'Enter image url',
		required: false,
	},
	{
		name: 'banner_image_url',
		label: 'Banner Image URL',
		placeholder: 'Enter banner image url',
		required: false,
	},
	{
		name: 'is_active',
		label: 'Is Active',
		required: true,
		type: 'checkbox',
	},
	{
		name: 'display_order',
		label: 'Display Order',
		placeholder: 'Enter display order',
		required: true,
		type: 'number',
	},
	{
		name: 'meta_title',
		label: 'Meta Title',
		placeholder: 'Enter meta title',
		required: false,
	},
	{
		name: 'meta_description',
		label: 'Meta Description',
		placeholder: 'Enter meta description',
		required: false,
		type: 'textarea',
	},
	{
		name: 'meta_keywords',
		label: 'Meta Keywords',
		placeholder: 'Enter meta keywords',
		required: false,
	},
	{
		name: 'category_system_id',
		label: 'Category System ID',
		placeholder: 'Select a system',
		required: true,
		type: 'select',
		options: [],
		defaultValue: null,
	},
]

const EditCategoryPage: React.FC = () => {
	const router = useRouter()
	const params = useParams()
	const categoryId = params.id
	const [isLoading, setIsLoading] = useState(true)
	const [category, setCategory] = useState<Category | null>(null)
	const [categorySystemOptions, setCategorySystemOptions] = useState<
		OptionType[]
	>([])
	const [loadingCategorySystems, setLoadingCategorySystems] = useState(true)
	const [errorCategorySystems, setErrorCategorySystems] = useState<
		string | null
	>(null)

	const {
		register,
		handleSubmit,
		setError,
		reset,
		formState: { errors, isSubmitting },
		control,
		watch,
		setValue,
	} = useForm<CategoryCreateFormData>({
		resolver: zodResolver(categoryCreateSchema),
		defaultValues: {
			name: '',
			description: '',
			image_url: '',
			banner_image_url: '',
			is_active: true,
			meta_title: '',
			meta_description: '',
			meta_keywords: '',
			display_order: 1,
			category_system_id: undefined,
			parent: undefined,
		},
	})

	useEffect(() => {
		if (categoryId) {
			const fetchCategory = async () => {
				try {
					const cs = await categorySystemService.fetch()
					if (cs.count > 0) {
						setCategorySystemOptions(
							cs.results.map((cs) => ({
								value: cs.id,
								label: cs.name,
							})),
						)
						if (watch('category_system_id') === null) {
							setValue('category_system_id', cs.results[0].id)
						} else {
							setValue('category_system_id', watch('category_system_id'))
						}
					}
					const res = await categoryService.get(parseInt(categoryId as string))
					setCategory(res)
					reset({
						name: res.name,
						description: res.description || '',
						image_url: res.image_url || '',
						banner_image_url: res.banner_image_url || '',
						is_active: res.is_active,
						meta_title: res.meta_title || '',
						meta_description: res.meta_description || '',
						meta_keywords: res.meta_keywords || '',
						display_order: res.display_order,
						category_system_id: res.category_system_id,
					})
				} catch (e: unknown) {
					if (e instanceof Error) {
						console.error(e.message)
						setError('root.serverError', {
							type: 'server',
							message: FAILED_LOADING_CATEGORIES_ERROR,
						})
						setErrorCategorySystems(e.message)
						toast.error(FAILED_LOADING_CATEGORIES_ERROR)
						router.push(CATEGORIES_URL)
					}
				} finally {
					setIsLoading(false)
					setLoadingCategorySystems(false)
				}
			}
			fetchCategory()
		}
	}, [categoryId, reset, router, setError, setValue, watch])

	const onSubmit = async (data: CategoryCreateFormData) => {
		try {
			const res = await categoryService.update(
				parseInt(categoryId as string),
				data,
			)
			toast.success(`Category ${res.name} updated successfully!`)
			router.push(CATEGORIES_URL)
		} catch (e: unknown) {
			handleFormErrors<CategoryCreateFormData>(
				e,
				setError,
				'Failed to edit category. Please review your input.',
			)
		}
	}

	if (isLoading) {
		return <SpinnerSection spinnerMessage='Loading category...' />
	}

	if (!category) {
		return <div className='text-center py-8'>Category not found</div>
	}

	return (
		<PermissionGuard requiredPermission={CATEGORY_PERMISSIONS.CHANGE}>
			<CreateFormLayout
				title='Edit Category'
				isSubmitting={isSubmitting}
				submitText='Save'
				submittingText='Saving...'
				cancelUrl={`${CATEGORIES_URL}/${categoryId}`}
				handleSubmit={handleSubmit(onSubmit)}
			>
				{fields.map((f, idx) => {
					let fieldWithOptions = f
					if (f.name === 'category_system_id') {
						fieldWithOptions = {
							...f,
							options: categorySystemOptions,
							readOnly: loadingCategorySystems || !!errorCategorySystems,
							placeholder: loadingCategorySystems
								? 'Loading category systems...'
								: errorCategorySystems || f.placeholder,
						}
					}
					return (
						<FormInput
							key={idx}
							field={fieldWithOptions}
							register={register}
							control={control}
							errorMessage={errors[f.name]?.message as string}
						/>
					)
				})}
			</CreateFormLayout>
		</PermissionGuard>
	)
}

export default EditCategoryPage

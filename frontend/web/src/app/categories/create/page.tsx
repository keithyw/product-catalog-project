'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import PermissionGuard from '@/components/auth/PermissionGuard'
import CreateFormLayout from '@/components/layout/CreateFormLayout'
import FormInput from '@/components/ui/form/FormInput'
import ParentCategorySelector from '@/components/ui/form/ParentCategorySelector'
import { CATEGORIES_URL } from '@/lib/constants'
import { CATEGORY_PERMISSIONS } from '@/lib/constants/permissions'
import categoryService from '@/lib/services/category'
import categorySystemService from '@/lib/services/categorySystem'
import { handleFormErrors } from '@/lib/utils/errorHandler'
import {
	categoryCreateSchema,
	CategoryCreateFormData,
} from '@/schemas/categorySchema'
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

export default function CreateCategoryPage() {
	const router = useRouter()
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
		reset,
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

	const [categorySystemOptions, setCategorySystemOptions] = useState<
		OptionType[]
	>([])
	const [loadingCategorySystems, setLoadingCategorySystems] = useState(true)
	const [errorCategorySystems, setErrorCategorySystems] = useState<
		string | null
	>(null)

	const selectedCategorySystemId = watch('category_system_id')

	useEffect(() => {
		const fetchSystems = async () => {
			setLoadingCategorySystems(true)
			try {
				const res = await categorySystemService.fetch()
				if (res.count > 0) {
					setCategorySystemOptions(
						res.results.map((cs) => ({
							value: cs.id,
							label: cs.name,
						})),
					)
					if (
						watch('category_system_id') === undefined &&
						res.results.length > 0
					) {
						setValue('category_system_id', res.results[0].id)
					}
				}
			} catch (e: unknown) {
				if (e instanceof Error) {
					setErrorCategorySystems(e.message)
					console.error(e.message)
				}
			} finally {
				setLoadingCategorySystems(false)
			}
		}
		fetchSystems()
	}, [setValue, watch])

	const onSubmit = async (data: CategoryCreateFormData) => {
		try {
			const res = await categoryService.create({
				...data,
				verification_status: 'EXEMPT',
				is_ai_generated: false,
			})
			toast.success(`Category ${res.name} created successfully!`)
			reset()
			router.push(CATEGORIES_URL)
		} catch (e: unknown) {
			handleFormErrors<CategoryCreateFormData>(
				e,
				setError,
				'Failed to create category. Please review your input.',
			)
		}
	}

	return (
		<PermissionGuard requiredPermission={CATEGORY_PERMISSIONS.ADD}>
			<CreateFormLayout
				title='Create New Category'
				isSubmitting={isSubmitting}
				submitText='Create'
				submittingText='Creating...'
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
				<ParentCategorySelector
					name='parent'
					control={control}
					label='Parent Category'
					placeholder='Select a parent category'
					required={false}
					selectedCategorySystemId={selectedCategorySystemId}
					errorMessage={errors.parent?.message}
				/>
			</CreateFormLayout>
		</PermissionGuard>
	)
}

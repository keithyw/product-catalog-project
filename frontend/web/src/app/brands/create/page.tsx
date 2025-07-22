'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import PermissionGuard from '@/components/auth/PermissionGuard'
import CreateFormLayout from '@/components/layout/CreateFormLayout'
import FormInput from '@/components/ui/FormInput'
import { BRANDS_URL } from '@/lib/constants'
import { BRAND_PERMISSIONS } from '@/lib/constants/permissions'
import brandService from '@/lib/services/brand'
import { handleFormErrors } from '@/lib/utils/errorHandler'
import { brandCreateSchema, BrandCreateFormData } from '@/schemas/brandSchema'
import { FormField } from '@/types/form'

const formFields: FormField<BrandCreateFormData>[] = [
	{
		name: 'name',
		label: 'Brand Name',
		placeholder: 'Enter brand name',
		required: true,
	},
	{
		name: 'description',
		label: 'Description',
		placeholder: 'Enter description',
		required: false,
	},
	{
		name: 'logo_url',
		label: 'Logo URL',
		placeholder: 'Enter logo url',
		required: false,
	},
	{
		name: 'website_url',
		label: 'Website URL',
		placeholder: 'Enter website url',
		required: false,
	},
	{
		name: 'contact_email',
		label: 'Contact Email',
		placeholder: 'Enter contact email',
		required: false,
	},
]

export default function CreateBrandPage() {
	const router = useRouter()
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<BrandCreateFormData>({
		resolver: zodResolver(brandCreateSchema),
		defaultValues: {
			name: '',
			description: '',
			logo_url: '',
			website_url: '',
			contact_email: '',
		},
	})

	const onSubmit = async (data: BrandCreateFormData) => {
		try {
			const res = await brandService.create(data)
			toast.success(`Brand ${res.name} created successfully!`)
			reset()
			router.push(BRANDS_URL)
		} catch (e: unknown) {
			handleFormErrors<BrandCreateFormData>(
				e,
				setError,
				'Failed to create brand. Please review your input.',
			)
		}
	}

	return (
		<PermissionGuard requiredPermission={BRAND_PERMISSIONS.ADD}>
			<CreateFormLayout
				title='Create New Brand'
				isSubmitting={isSubmitting}
				submitText='Create'
				submittingText='Creating...'
				handleSubmit={handleSubmit(onSubmit)}
			>
				{formFields.map((f, idx) => (
					<FormInput
						key={idx}
						field={f}
						register={register}
						errorMessage={errors[f.name]?.message as string}
					/>
				))}
			</CreateFormLayout>
		</PermissionGuard>
	)
}

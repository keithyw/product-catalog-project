'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useParams, useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import PermissionGuard from '@/components/auth/PermissionGuard'
import CreateFormLayout from '@/components/layout/CreateFormLayout'
import FormInput from '@/components/ui/form/FormInput'
import SpinnerSection from '@/components/ui/SpinnerSection'
import { BRANDS_URL, FAILED_LOADING_BRANDS_ERROR } from '@/lib/constants'
import { BRAND_PERMISSIONS } from '@/lib/constants/permissions'
import brandService from '@/lib/services/brand'
import { handleFormErrors } from '@/lib/utils/errorHandler'
import { brandCreateSchema, BrandCreateFormData } from '@/schemas/brandSchema'
import { Brand } from '@/types/brand'
import { FormField } from '@/types/form'

const fields: FormField<BrandCreateFormData>[] = [
	{
		name: 'name',
		label: 'Brand Name',
		placeholder: 'Enter brand name',
		required: true,
	},
	{
		name: 'description',
		label: 'Description',
		placeholder: 'Enter brand description',
		required: false,
	},
	{
		name: 'logo_url',
		label: 'Logo URL',
		placeholder: 'Enter brand logo URL',
		required: false,
	},
	{
		name: 'website_url',
		label: 'Website URL',
		placeholder: 'Enter brand website URL',
		required: false,
	},
	{
		name: 'contact_email',
		label: 'Contact Email',
		placeholder: 'Enter brand contact email',
		required: false,
	},
]

export default function EditBrandPage() {
	const params = useParams()
	const router = useRouter()
	const brandId = params.id
	const [isLoading, setIsLoading] = useState(true)
	const [brand, setBrand] = useState<Brand | null>(null)

	const {
		register,
		handleSubmit,
		setError,
		reset,
		formState: { errors, isSubmitting },
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

	useEffect(() => {
		if (brandId) {
			const fetchBrand = async () => {
				try {
					const res = await brandService.get(parseInt(brandId as string))
					setBrand(res)
					reset({
						name: res.name,
						description: res.description || '',
						logo_url: res.logo_url || '',
						website_url: res.website_url || '',
						contact_email: res.contact_email || '',
					})
				} catch (e: unknown) {
					if (e instanceof Error) {
						console.error(e.message)
						setError('root.serverError', {
							type: 'server',
							message: FAILED_LOADING_BRANDS_ERROR,
						})
						toast.error(FAILED_LOADING_BRANDS_ERROR)
						router.push(BRANDS_URL)
					}
				} finally {
					setIsLoading(false)
				}
			}
			fetchBrand()
		}
	}, [brandId, reset, router, setError])

	const onSubmit = async (data: BrandCreateFormData) => {
		try {
			const res = await brandService.update(parseInt(brandId as string), data)
			toast.success(`Brand ${res.name} updated successfully!`)
			router.push(BRANDS_URL)
		} catch (e: unknown) {
			handleFormErrors<BrandCreateFormData>(
				e,
				setError,
				'Failed to edit brand. Please review your input.',
			)
		}
	}

	if (isLoading) {
		return <SpinnerSection spinnerMessage='Loading brand...' />
	}

	if (!brand) {
		return <div className='text-center py-8'>Brand not found</div>
	}

	return (
		<PermissionGuard requiredPermission={BRAND_PERMISSIONS.CHANGE}>
			<CreateFormLayout
				title='Edit Brand'
				isSubmitting={isSubmitting}
				submitText='Save'
				submittingText='Saving...'
				cancelUrl={`${BRANDS_URL}/${brandId}`}
				handleSubmit={handleSubmit(onSubmit)}
			>
				{fields.map((f, idx) => (
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

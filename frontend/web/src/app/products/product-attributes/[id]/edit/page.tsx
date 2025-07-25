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
import {
	FAILED_LOADING_PRODUCT_ATTIBUTE_ERROR,
	PRODUCT_ATTIBUTES_URL,
} from '@/lib/constants'
import { PRODUCT_ATTIBUTE_PERMISSIONS } from '@/lib/constants/permissions'
import productAttributeService from '@/lib/services/productAttribute'
import { handleFormErrors } from '@/lib/utils/errorHandler'
import {
	productAttributeCreateSchema,
	ProductAttributeCreateFormData,
} from '@/schemas/productAttributeSchema'
import { FormField } from '@/types/form'
import { ATTRIBUTE_TYPE_OPTIONS, ProductAttribute } from '@/types/product'

const fields: FormField<ProductAttributeCreateFormData>[] = [
	{
		name: 'name',
		label: 'Attribute Name',
		placeholder: 'e.g., Author, Color, ISBN',
		required: true,
		type: 'text',
	},
	{
		name: 'description',
		label: 'Description',
		placeholder: 'A brief description of this attribute',
		required: false,
		type: 'textarea',
	},
	{
		name: 'type',
		label: 'Attribute Type',
		required: true,
		type: 'select',
		options: ATTRIBUTE_TYPE_OPTIONS,
		placeholder: 'Select attribute type',
	},
	{
		name: 'is_required',
		label: 'Is Required?',
		required: false,
		type: 'checkbox',
	},
]

export default function EditProductAttributePage() {
	const router = useRouter()
	const params = useParams()
	const productAttributeId = params.id
	const [isLoading, setIsLoading] = useState(true)
	const [productAttribute, setProductAttribute] =
		useState<ProductAttribute | null>(null)

	const {
		register,
		handleSubmit,
		setError,
		reset,
		formState: { errors, isSubmitting },
		control,
		watch,
	} = useForm<ProductAttributeCreateFormData>({
		resolver: zodResolver(productAttributeCreateSchema),
		defaultValues: {
			name: '',
			description: '',
			type: 'text',
			is_required: false,
			default_value: null,
			options: null,
			validation_rules: null,
		},
	})

	const selectedType = watch('type')

	useEffect(() => {
		if (!productAttributeId) {
			setIsLoading(false)
			setError('root.serverError', {
				type: 'server',
				message: FAILED_LOADING_PRODUCT_ATTIBUTE_ERROR,
			})
			return
		}
		const fetchProductAttribute = async () => {
			try {
				const res = await productAttributeService.get(
					parseInt(productAttributeId as string),
				)
				setProductAttribute(res)
				reset({
					name: res.name,
					description: res.description || '',
					type: res.type,
					is_required: res.is_required,
					default_value:
						res.default_value !== null
							? JSON.stringify(res.default_value, null, 2)
							: null,
					options:
						res.options !== null ? JSON.stringify(res.options, null, 2) : null,
					validation_rules:
						res.validation_rules !== null
							? JSON.stringify(res.validation_rules, null, 2)
							: null,
				})
			} catch (e: unknown) {
				if (e instanceof Error) {
					setError('root.serverError', {
						type: 'server',
						message: FAILED_LOADING_PRODUCT_ATTIBUTE_ERROR,
					})
					toast.error(FAILED_LOADING_PRODUCT_ATTIBUTE_ERROR)
					router.push(PRODUCT_ATTIBUTES_URL)
				}
			} finally {
				setIsLoading(false)
			}
		}
		fetchProductAttribute()
	}, [productAttributeId, reset, router, setError, setProductAttribute])

	const onSubmit = async (data: ProductAttributeCreateFormData) => {
		try {
			const form = {
				...data,
				type: data.type as ProductAttribute['type'],
				default_value: data.default_value
					? JSON.parse(data.default_value)
					: null,
				options: data.options ? JSON.parse(data.options) : null,
				validation_rules: data.validation_rules
					? JSON.parse(data.validation_rules)
					: null,
			}
			const res = await productAttributeService.update(
				parseInt(productAttributeId as string),
				form,
			)
			toast.success(`Product attribute ${res.name} updated successfully!`)
			router.push(PRODUCT_ATTIBUTES_URL)
		} catch (e: unknown) {
			handleFormErrors<ProductAttributeCreateFormData>(
				e,
				setError,
				'Failed to edit product attribute. Please review your input.',
			)
		}
	}

	if (isLoading) {
		return <SpinnerSection spinnerMessage='Loading product attribute...' />
	}

	if (!productAttribute) {
		return <div className='text-center py-8'>Product attribute not found</div>
	}

	return (
		<PermissionGuard requiredPermission={PRODUCT_ATTIBUTE_PERMISSIONS.CHANGE}>
			<CreateFormLayout
				title='Edit Product Attribute'
				isSubmitting={isSubmitting}
				submitText='Save'
				submittingText='Saving...'
				cancelUrl={`${PRODUCT_ATTIBUTES_URL}/${productAttributeId}`}
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
				{selectedType !== 'json' && (
					<FormInput
						field={{
							name: 'default_value',
							label: 'Default Value',
							placeholder:
								'Enter default value (JSON, string, number, boolean)',
							required: false,
							type: 'textarea',
						}}
						register={register}
						control={control}
						errorMessage={errors.default_value?.message as string}
					/>
				)}
				{(selectedType === 'select' || selectedType === 'multiselect') && (
					<FormInput
						field={{
							name: 'options',
							label: 'Options (JSON Array)',
							placeholder: `e.g., [{"value": "red", "label": "Red"}]`,
							required: true,
							type: 'textarea',
						}}
						register={register}
						control={control}
						errorMessage={errors.options?.message as string}
					/>
				)}
				<FormInput
					field={{
						name: 'validation_rules',
						label: 'Validation Rules (JSON Object)',
						placeholder: `e.g., {"min": 0, "max": 100} or {"pattern": "^[A-Z]{2}$"}`,
						required: false,
						type: 'textarea',
					}}
					register={register}
					control={control}
					errorMessage={errors.validation_rules?.message as string}
				/>
			</CreateFormLayout>
		</PermissionGuard>
	)
}

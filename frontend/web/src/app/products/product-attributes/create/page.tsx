'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import PermissionGuard from '@/components/auth/PermissionGuard'
import CreateFormLayout from '@/components/layout/CreateFormLayout'
import FormInput from '@/components/ui/form/FormInput'
import { PRODUCT_ATTRIBUTES_URL } from '@/lib/constants'
import { PRODUCT_ATTRIBUTE_PERMISSIONS } from '@/lib/constants/permissions'
import productAttributeService from '@/lib/services/productAttribute'
import { handleFormErrors } from '@/lib/utils/errorHandler'
import {
	productAttributeCreateSchema,
	ProductAttributeCreateFormData,
} from '@/schemas/productAttributeSchema'
import { FormField } from '@/types/form'
import { ATTRIBUTE_TYPE_OPTIONS, ProductAttributeType } from '@/types/product'

const fields: FormField<ProductAttributeCreateFormData>[] = [
	{
		name: 'name',
		label: 'Attribute Name',
		placeholder: 'e.g., Author, Color, ISBN',
		required: true,
		type: 'text',
	},
	{
		name: 'display_name',
		label: 'Display Name',
		placeholder: 'Front facing name to user',
		required: false,
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

export default function CreateProductAttributePage() {
	const router = useRouter()
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
		reset,
		control,
		watch,
	} = useForm<ProductAttributeCreateFormData>({
		resolver: zodResolver(productAttributeCreateSchema),
		defaultValues: {
			name: '',
			display_name: '',
			description: '',
			type: 'text',
			is_required: false,
			default_value: '',
			options: null,
			validation_rules: null,
		},
	})

	const selectedType = watch('type')

	const onSubmit = async (data: ProductAttributeCreateFormData) => {
		try {
			const f = {
				...data,
				type: data.type as ProductAttributeType,
				default_value: data.default_value
					? JSON.parse(data.default_value)
					: null,
				options: data.options ? JSON.parse(data.options) : null,
				validation_rules: data.validation_rules
					? JSON.parse(data.validation_rules)
					: null,
			}
			const res = await productAttributeService.create(f)
			toast.success(`Product attribute ${res.name} created successfully!`)
			reset()
			router.push(PRODUCT_ATTRIBUTES_URL)
		} catch (e: unknown) {
			handleFormErrors<ProductAttributeCreateFormData>(
				e,
				setError,
				'Failed to create product attribute. Please review your input.',
			)
		}
	}

	return (
		<PermissionGuard requiredPermission={PRODUCT_ATTRIBUTE_PERMISSIONS.ADD}>
			<CreateFormLayout
				title='Create New Product Attribute'
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

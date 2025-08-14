'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import PermissionGuard from '@/components/auth/PermissionGuard'
import CreateFormLayout from '@/components/layout/CreateFormLayout'
import Button from '@/components/ui/form/Button'
import FormInput from '@/components/ui/form/FormInput'
import OptionsEditorModal from '@/components/ui/modals/OptionsEditorModal'
import ValidationRulesEditorModal from '@/components/ui/modals/ValidationRulesEditorModal'
import { PRODUCT_ATTRIBUTES_URL } from '@/lib/constants'
import { PRODUCT_ATTRIBUTE_PERMISSIONS } from '@/lib/constants/permissions'
import productAttributeService from '@/lib/services/productAttribute'
import { handleFormErrors } from '@/lib/utils/errorHandler'
import {
	productAttributeCreateSchema,
	ProductAttributeCreateFormData,
} from '@/schemas/productAttributeSchema'
import { FormField, OptionType } from '@/types/form'
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
		name: 'display_order',
		label: 'Display Order',
		placeholder: 'Order in which this attribute appears',
		required: false,
		type: 'number',
	},
	{
		name: 'sample_values',
		label: 'Sample Values',
		placeholder: 'hint to AI with comma separated values',
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
	const [isOptionsEditorOpen, setIsOptionsEditorOpen] = useState(false)
	const [isValidationRulesEditorOpen, setIsValidationRulesEditorOpen] =
		useState(false)

	const {
		register,
		handleSubmit,
		setError,
		setValue,
		formState: { errors, isSubmitting },
		reset,
		control,
		watch,
	} = useForm<ProductAttributeCreateFormData>({
		resolver: zodResolver(productAttributeCreateSchema),
		defaultValues: {
			name: '',
			display_name: '',
			display_order: '',
			sample_values: '',
			description: '',
			type: 'text',
			is_required: false,
			default_value: '',
			options: null,
			validation_rules: null,
		},
	})

	const selectedType = watch('type')
	const options = watch('options') || '[]'

	const onCloseEditOptionsModal = () => {
		setIsOptionsEditorOpen(false)
	}

	const handleSaveOptions = (newOptions: OptionType[]) => {
		setValue('options', JSON.stringify(newOptions))
	}

	const onCloseValidationRulesEditorModal = () => {
		setIsValidationRulesEditorOpen(false)
	}

	const onSubmit = async (data: ProductAttributeCreateFormData) => {
		try {
			const f = {
				...data,
				display_order: data.display_order
					? parseInt(data.display_order as string)
					: null,
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
					<>
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
						<Button
							actionType='neutral'
							onClick={() => setIsOptionsEditorOpen(true)}
						>
							Use Options Editor
						</Button>
					</>
				)}
				<>
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
					<Button
						actionType='neutral'
						onClick={() => setIsValidationRulesEditorOpen(true)}
					>
						Use Validation Rules Editor
					</Button>
				</>
				<OptionsEditorModal
					isOpen={isOptionsEditorOpen}
					options={JSON.parse(options)}
					onClose={onCloseEditOptionsModal}
					onSave={handleSaveOptions}
				/>
				<ValidationRulesEditorModal
					isOpen={isValidationRulesEditorOpen}
					attributeType={selectedType as ProductAttributeType}
					rules={JSON.parse(watch('validation_rules') || '{}')}
					onClose={onCloseValidationRulesEditorModal}
					onSave={(rules) => setValue('validation_rules', rules)}
				/>
			</CreateFormLayout>
		</PermissionGuard>
	)
}

'use client'

import React from 'react'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import PermissionGuard from '@/components/auth/PermissionGuard'
import CreateFormLayout from '@/components/layout/CreateFormLayout'
import FormInput from '@/components/ui/form/FormInput'
import { PRICING_RULES_URL, PRODUCT_PERMISSIONS } from '@/lib/constants'
import priceRulesService from '@/lib/services/priceRules'
import { handleFormErrors } from '@/lib/utils/errorHandler'
import {
	priceRuleCreateSchema,
	PriceRuleCreateFormData,
} from '@/schemas/priceRuleSchema'
import { FormField } from '@/types/form'
import { CreatePriceRuleRequest } from '@/types/product'

const fields: FormField<PriceRuleCreateFormData>[] = [
	{
		name: 'name',
		label: 'Name',
		placeholder: 'Enter rule name',
		required: true,
	},
	{
		name: 'description',
		label: 'Description',
		placeholder: 'Enter rule description',
		required: false,
		type: 'textarea',
	},
	{
		name: 'rule_type',
		label: 'Type',
		placeholder: 'Select a rule type',
		required: true,
	},
	{
		name: 'rule_config',
		label: 'Rule Config',
		placeholder: 'Enter rule config',
		required: false,
		type: 'textarea',
	},
	{
		name: 'callback_function',
		label: 'Callback Function',
		placeholder: 'Enter callback function',
		required: false,
	},
	{
		name: 'priority',
		label: 'Priority',
		placeholder: 'Enter rule priority',
		required: true,
		type: 'number',
	},
]

const PriceRulesCreatePage = () => {
	const router = useRouter()
	const {
		register,
		control,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<PriceRuleCreateFormData>({
		resolver: zodResolver(priceRuleCreateSchema),
		defaultValues: {
			name: '',
			description: '',
			rule_type: '',
			rule_config: '',
			callback_function: '',
			priority: 1,
		},
	})

	const onSubmit = async (data: PriceRuleCreateFormData) => {
		const req: CreatePriceRuleRequest = {
			name: data.name,
			description: data.description || '',
			rule_type: data.rule_type,
			rule_config: data.rule_config ? JSON.parse(data.rule_config) : null,
			callback_function: data.callback_function || '',
			priority: data.priority as number,
			active_from: null,
			active_to: null,
			is_active: true,
		}
		try {
			const res = await priceRulesService.create(req)
			toast.success(`Price Rule ${res.name} created successfully!`)
			reset()
			router.push(PRICING_RULES_URL)
		} catch (e: unknown) {
			handleFormErrors<PriceRuleCreateFormData>(
				e,
				setError,
				'Failed to create price rule. Please review your input.',
			)
		}
	}
	return (
		<PermissionGuard requiredPermission={PRODUCT_PERMISSIONS.ADD}>
			<CreateFormLayout
				title='Create New Price Rule'
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
			</CreateFormLayout>
		</PermissionGuard>
	)
}

export default PriceRulesCreatePage

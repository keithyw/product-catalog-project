'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useParams, useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import PermissionGuard from '@/components/auth/PermissionGuard'
import CreateFormLayout from '@/components/layout/CreateFormLayout'
import Button from '@/components/ui/form/Button'
import FormInput from '@/components/ui/form/FormInput'
import SpinnerSection from '@/components/ui/SpinnerSection'
import { PRICING_RULES_URL, PRODUCT_PERMISSIONS } from '@/lib/constants'
import priceRulesService from '@/lib/services/priceRules'
import { handleFormErrors } from '@/lib/utils/errorHandler'
import {
	priceRuleCreateSchema,
	PriceRuleCreateFormData,
} from '@/schemas/priceRuleSchema'
import { FormField } from '@/types/form'
import { RULE_TYPES, CreatePriceRuleRequest, PriceRule } from '@/types/product'
import RulesConfigModal from '@/app/pricing/rules/modals/RulesConfigModal'

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
	// {
	// 	name: 'rule_type',
	// 	label: 'Type',
	// 	placeholder: 'Select a rule type',
	// 	required: true,
	// },
	// {
	// 	name: 'rule_config',
	// 	label: 'Rule Config',
	// 	placeholder: 'Enter rule config',
	// 	required: false,
	// 	type: 'textarea',
	// },
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

const EditPriceRulesPage = () => {
	const router = useRouter()
	const params = useParams()
	const pricingRuleId = params.id
	const [isLoading, setIsLoading] = useState(true)
	const [pricingRule, setPricingRule] = useState<PriceRule | null>(null)
	const [isRulesConfigModalOpen, setIsRuleConfigModalOpen] = useState(false)
	const {
		register,
		handleSubmit,
		setError,
		reset,
		control,
		formState: { errors, isSubmitting },
		setValue,
		watch,
	} = useForm<PriceRuleCreateFormData>({
		resolver: zodResolver(priceRuleCreateSchema),
		defaultValues: {
			name: '',
			description: '',
			rule_type: '',
			rule_config: '',
			callback_function: '',
			priority: 0,
		},
	})

	const watchedRuleType = watch('rule_type')
	const watchedRuleConfig = watch('rule_config')

	useEffect(() => {
		if (!pricingRuleId) return
		const fetchData = async () => {
			setIsLoading(true)
			try {
				const res = await priceRulesService.get(
					parseInt(pricingRuleId as string),
				)
				setPricingRule(res)
				reset({
					name: res.name,
					description: res.description || '',
					rule_type: res.rule_type,
					rule_config: res.rule_config ? JSON.stringify(res.rule_config) : '',
					callback_function: res.callback_function || '',
					priority: res.priority,
				})
				setIsLoading(false)
			} catch (e: unknown) {
				console.error(e)
				setError('root.serverError', {
					type: 'server',
					message: 'Failed to load pricing rule. Please try again later.',
				})
				toast.error('Failed to load pricing rule. Please try again later.')
				router.push(PRICING_RULES_URL)
			} finally {
				setIsLoading(false)
			}
		}
		fetchData()
	}, [pricingRuleId, reset, router, setError])

	const handleRuleConfigUpdate = (type: string, config: string) => {
		setValue('rule_type', type)
		setValue('rule_config', config)
	}

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
			const res = await priceRulesService.patch(
				parseInt(pricingRuleId as string),
				req,
			)
			toast.success(`Price Rule ${res.name} updated successfully!`)
			router.push(PRICING_RULES_URL)
		} catch (e: unknown) {
			handleFormErrors<PriceRuleCreateFormData>(
				e,
				setError,
				'Failed to create price rule. Please review your input.',
			)
		}
	}

	if (isLoading) {
		return <SpinnerSection spinnerMessage='Loading...' />
	}

	if (!pricingRule) {
		return <div className='text-center py-8'>Pricing Rule not found</div>
	}

	return (
		<PermissionGuard requiredPermission={PRODUCT_PERMISSIONS.CHANGE}>
			<CreateFormLayout
				title='Edit Price Rule'
				isSubmitting={isSubmitting}
				submitText='Save'
				submittingText='Saving...'
				cancelUrl={PRICING_RULES_URL}
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
				<div className='my-4 pt-4 text-gray-700'>
					<h3 className='text-lg font-semibold mb-2'>Rule Configuration</h3>
					<div className='mb-2 text-sm font-medium'>
						Current Type:{' '}
						<span className='font-semibold text-indigo-600'>
							{RULE_TYPES.find((t) => t.value === watchedRuleType)?.label ||
								'Not Set'}
						</span>
					</div>
					<div className='mb-2 text-sm font-medium'>
						Current Config:{' '}
						<span className='font-semibold text-indigo-600'>
							{watchedRuleConfig}
						</span>
					</div>
					<Button
						actionType='view'
						type='button'
						onClick={() => setIsRuleConfigModalOpen(true)}
					>
						Click to Edit Rule Config
					</Button>
				</div>
			</CreateFormLayout>
			<RulesConfigModal
				initialRuleType={watchedRuleType}
				isOpen={isRulesConfigModalOpen}
				onClose={() => setIsRuleConfigModalOpen(false)}
				onUpdate={handleRuleConfigUpdate}
			/>
		</PermissionGuard>
	)
}

export default EditPriceRulesPage

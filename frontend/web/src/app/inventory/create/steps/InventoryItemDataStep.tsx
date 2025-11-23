import React, { useEffect } from 'react'
import toast from 'react-hot-toast'
import { useForm, Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import FormInput from '@/components/ui/form/FormInput'
import inventoryService from '@/lib/services/inventory'
import {
	inventoryItemSchema,
	InventoryItemFormData,
} from '@/schemas/inventoryItemSchema'
import useInventoryStore from '@/stores/useInventoryStore'
import { FormField } from '@/types/form'
import { CreateInventoryItemRequest } from '@/types/inventory'
import { StepComponentProps } from '@/types/wizard'

const fields: FormField<InventoryItemFormData>[] = [
	{
		name: 'sku',
		label: 'SKU',
		type: 'text',
		required: true,
	},
	{
		name: 'quantity',
		label: 'Quantity',
		type: 'number',
		required: true,
	},
	{
		name: 'reserved',
		label: 'Reserved',
		type: 'number',
		required: true,
	},
	{
		name: 'low_stock_threshold',
		label: 'Low Stock Threshold',
		type: 'number',
		required: true,
	},
]

const InventoryItemDataStep = ({ setSubmitHandler }: StepComponentProps) => {
	const {
		currentStep,
		inventoryItem,
		reset,
		setCurrentStep,
		setIsCurrentStepValid,
		setIsSubmitting,
	} = useInventoryStore()
	const {
		control,
		formState: { errors, isValid, isSubmitting },
		getValues,
		register,
		trigger,
	} = useForm<InventoryItemFormData>({
		resolver: zodResolver(
			inventoryItemSchema,
		) as Resolver<InventoryItemFormData>,
		defaultValues: {
			sku: '',
			quantity: 0,
			reserved: 0,
			low_stock_threshold: 0,
		},
		mode: 'onChange',
	})

	useEffect(() => {
		setIsCurrentStepValid(isValid)
		setIsSubmitting(isSubmitting)
	}, [isValid, isSubmitting, setIsCurrentStepValid, setIsSubmitting])

	useEffect(() => {
		const handleStepSubmit = async (): Promise<boolean> => {
			const isFormValid = await trigger()
			setIsSubmitting(true)
			if (isFormValid) {
				const data = getValues()
				try {
					const req: CreateInventoryItemRequest = {
						product: inventoryItem?.product as number,
						attributes_data: inventoryItem?.attributes_data,
						sku: data.sku!,
						quantity: data.quantity!,
						reserved: data.reserved!,
						low_stock_threshold: data.low_stock_threshold!,
						is_active: true,
					}
					await inventoryService.create(req)
					setCurrentStep(currentStep + 1)
					reset()
					return true
				} catch (e: unknown) {
					if (e instanceof Error) {
						toast.error(e.message)
						return false
					}
				} finally {
					setIsSubmitting(false)
				}
			}
			return false
		}
		setSubmitHandler(handleStepSubmit)
		return () => {
			setSubmitHandler(null)
		}
	}, [
		inventoryItem,
		currentStep,
		reset,
		setCurrentStep,
		setIsCurrentStepValid,
		setIsSubmitting,
		setSubmitHandler,
		trigger,
		getValues,
	])
	return (
		<div className='space-y-4'>
			{fields.map((f, idx) => (
				<FormInput
					key={idx}
					field={f}
					control={control}
					register={register}
					errorMessage={
						errors[f.name as keyof InventoryItemFormData]?.message as string
					}
				/>
			))}
		</div>
	)
}

export default InventoryItemDataStep

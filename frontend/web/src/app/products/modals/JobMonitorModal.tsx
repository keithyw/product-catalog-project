import React from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { DialogTitle } from '@headlessui/react'
import Button from '@/components/ui/form/Button'
import FormInput from '@/components/ui/form/FormInput'
import BaseModal from '@/components/ui/modals/BaseModal'
import ModalButtonActionSection from '@/components/ui/modals/ModalButtonActionSection'
import productMonitorJobService from '@/lib/services/productMonitorJob'
import { handleFormErrors } from '@/lib/utils/errorHandler'
import {
	productMonitorJobSchema,
	ProductMonitorJobFormData,
} from '@/schemas/productMonitorJobSchema'
import useProductStore from '@/stores/useProductStore'
import { FormField } from '@/types/form'
import { Product, CreateProductMonitorJobRequest } from '@/types/product'

const fields: FormField<ProductMonitorJobFormData>[] = [
	{
		name: 'target_price',
		label: 'Target Price',
		placeholder: 'Enter target price',
		type: 'number',
		required: true,
	},
	{
		name: 'frequency',
		label: 'Frequency',
		placeholder: 'Enter frequency of job',
		required: true,
	},
]

interface JobMonitorModalProps {
	isOpen: boolean
	onClose: () => void
}

const JobMonitorModal = ({ isOpen, onClose }: JobMonitorModalProps) => {
	const { product, setProductMonitorJob } = useProductStore()
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<ProductMonitorJobFormData>({
		resolver: zodResolver(productMonitorJobSchema),
		defaultValues: {
			target_price: 0,
			frequency: '',
		},
	})

	const onSave = async (data: ProductMonitorJobFormData) => {
		const req: CreateProductMonitorJobRequest = {
			product: parseInt((product as Product).id),
			target_price: data.target_price,
			frequency: data.frequency,
			is_active: true,
		}
		try {
			const res = await productMonitorJobService.create(req)
			setProductMonitorJob(res)
			reset()
			toast.success(
				`Product ${(product as Product).name} monitor job successfully created!`,
			)
			onClose()
		} catch (e: unknown) {
			handleFormErrors<ProductMonitorJobFormData>(
				e,
				setError,
				'Failed to create job',
			)
		}
	}

	return (
		<BaseModal isOpen={isOpen} onClose={onClose}>
			<div className='mt-4 space-y-4'>
				<form onSubmit={handleSubmit(onSave)}>
					<DialogTitle
						as='h2'
						className='text-lg font-medium font-semibold leading-6 text-gray-900'
					>
						Monitor for Sales for {(product as Product).name}
					</DialogTitle>
					<div className='text-sm text-gray-500'>
						<p>
							Fill in the monitoring enough to create a job to seek out links.
						</p>
						{fields.map((f, idx) => (
							<FormInput
								key={idx}
								field={f}
								register={register}
								errorMessage={errors[f.name]?.message as string}
							/>
						))}
					</div>
					<ModalButtonActionSection>
						<Button actionType='submit' disabled={isSubmitting}>
							Save
						</Button>
						<Button
							actionType='neutral'
							disabled={isSubmitting}
							onClick={() => {
								reset()
								onClose()
							}}
						>
							Cancel
						</Button>
					</ModalButtonActionSection>
				</form>
			</div>
		</BaseModal>
	)
}

export default JobMonitorModal

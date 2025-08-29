'use client'

import React from 'react'
import PermissionGuard from '@/components/auth/PermissionGuard'
import CreateFormLayout from '@/components/layout/CreateFormLayout'
import ServerErrorMessages from '@/components/layout/ServerErrorMessages'
import FormInput from '@/components/ui/form/FormInput'
import SpinnerSection from '@/components/ui/SpinnerSection'
import { FormField } from '@/types/form'
import { Control, FieldErrors, UseFormRegister } from 'react-hook-form'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface EditItemLayoutProps<T extends Record<string, any>> {
	permission: string
	item: T
	title: string
	fields: FormField<T>[]
	isLoading: boolean
	isSubmitting: boolean
	loadingError: string | null
	handleSubmit: React.FormEventHandler<HTMLFormElement>
	register: UseFormRegister<T>
	control: Control<T>
	errors: FieldErrors
	children?: React.ReactNode
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EditItemLayout = <T extends Record<string, any>>({
	permission,
	item,
	title,
	fields,
	isLoading,
	isSubmitting,
	loadingError,
	handleSubmit,
	register,
	control,
	errors,
	children,
}: EditItemLayoutProps<T>) => {
	if (isLoading) {
		return <SpinnerSection spinnerMessage='Loading item...' />
	}

	if (!item) {
		return <ServerErrorMessages errorMessages={loadingError as string} />
	}

	return (
		<PermissionGuard requiredPermission={permission}>
			<CreateFormLayout
				title={title}
				isSubmitting={isSubmitting}
				submitText='Save'
				submittingText='Saving...'
				handleSubmit={handleSubmit}
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
				{children}
			</CreateFormLayout>
		</PermissionGuard>
	)
}

export default EditItemLayout

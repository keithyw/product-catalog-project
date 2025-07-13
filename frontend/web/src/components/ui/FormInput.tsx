import React from 'react'
import { UseFormRegister, Path } from 'react-hook-form'
import CheckboxInput from '@/components/ui/CheckboxInput'
import InputErrorMessage from '@/components/ui/InputErrorMessage'
import TextInput from '@/components/ui/TextInput'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface FormInputProps<T extends Record<string, any>> {
	field: {
		name: keyof T
		label: string
		type?: string
		required?: boolean
		placeholder?: string
		readOnly?: boolean
	}
	register: UseFormRegister<T>
	errorMessage?: string
}

const FormInput = <
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	T extends Record<string, any>,
>({
	field,
	register,
	errorMessage,
}: FormInputProps<T>) => {
	const inputProps = {
		id: field.name as string,
		label: field.label,
		...register(field.name as Path<T>),
		readOnly: field.readOnly,
	}

	switch (field.type) {
		case 'checkbox':
			return (
				<>
					<CheckboxInput {...inputProps} />
					<InputErrorMessage errorMessage={errorMessage as string} />
				</>
			)
		case 'password':
		case 'email':
		case 'text':
		default:
			return (
				<>
					<TextInput
						type={field.type}
						placeholder={field.placeholder}
						required={field.required}
						{...inputProps}
					/>
					<InputErrorMessage errorMessage={errorMessage as string} />
				</>
			)
	}
}

export default FormInput

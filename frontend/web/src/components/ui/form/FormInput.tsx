import React from 'react'
import { UseFormRegister, Path, Control, Controller } from 'react-hook-form'
import CheckboxInput from '@/components/ui/form/CheckboxInput'
import InputErrorMessage from '@/components/ui/form/InputErrorMessage'
import SelectDropdown from '@/components/ui/form/SelectDropdown'
import TextareaInput from '@/components/ui/form/TextareaInput'
import TextInput from '@/components/ui/form/TextInput'
import { FormField } from '@/types/form'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface FormInputProps<T extends Record<string, any>> {
	// field: {
	// 	name: keyof T
	// 	label: string
	// 	type?: string
	// 	required?: boolean
	// 	placeholder?: string
	// 	readOnly?: boolean
	// }
	field: FormField<T>
	register: UseFormRegister<T>
	errorMessage?: string
	control?: Control<T>
	// currentValue?: string | number | null
}

const FormInput = <
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	T extends Record<string, any>,
>({
	field,
	register,
	errorMessage,
	control,
	// currentValue,
}: FormInputProps<T>) => {
	// const inputProps = {
	// 	id: field.name as string,
	// 	label: field.label,
	// 	...register(field.name as Path<T>),
	// 	readOnly: field.readOnly,
	// }

	const inputProps = {
		id: field.name as string,
		label: field.label,
		readOnly: field.readOnly,
	}

	switch (field.type) {
		case 'checkbox':
			return (
				<>
					<CheckboxInput {...inputProps} {...register(field.name as Path<T>)} />
					<InputErrorMessage errorMessage={errorMessage as string} />
				</>
			)
		case 'select':
			if (!control) {
				console.error('Control is required')
				return null
			}
			return (
				<Controller
					name={field.name as Path<T>}
					control={control}
					rules={{ required: field.required }}
					render={({ field: controllerField }) => (
						<>
							<SelectDropdown
								{...inputProps}
								name={controllerField.name}
								options={field.options || []}
								selectedValue={controllerField.value as number | string | null}
								onSelect={(v) => {
									controllerField.onChange(v)
								}}
								onBlur={controllerField.onBlur}
								disabled={controllerField.disabled}
								placeholder={field.placeholder}
							/>
							<InputErrorMessage errorMessage={errorMessage as string} />
						</>
					)}
				/>
			)
		case 'textarea':
			return (
				<>
					<TextareaInput {...inputProps} {...register(field.name as Path<T>)} />
					<InputErrorMessage errorMessage={errorMessage as string} />
				</>
			)
		case 'password':
		case 'email':
		case 'number':
		case 'text':
		default:
			return (
				<>
					<TextInput
						type={field.type}
						placeholder={field.placeholder}
						required={field.required}
						{...inputProps}
						{...register(field.name as Path<T>)}
					/>
					<InputErrorMessage errorMessage={errorMessage as string} />
				</>
			)
	}
}

export default FormInput

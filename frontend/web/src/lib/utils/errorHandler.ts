import axios, { AxiosError } from 'axios'
import { UseFormSetError, Path } from 'react-hook-form'
import toast from 'react-hot-toast'
import { GENERIC_SERVER_ERROR, UNEXPECTED_SERVER_ERROR } from '@/lib/constants'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormFields = Record<string, any>

export function handleFormErrors<T extends FormFields>(
	e: unknown,
	setError: UseFormSetError<T>,
	defaultToastMessage?: string,
) {
	if (axios.isAxiosError(e)) {
		const err = e as AxiosError
		if (err.response && err.response.data) {
			const backendErrors = err.response.data as Record<
				string,
				string[] | string
			>
			let toastMessage: string | null = null

			if (backendErrors.non_field_errors) {
				toastMessage = Array.isArray(backendErrors.non_field_errors)
					? backendErrors.non_field_errors.join(', ')
					: (backendErrors.non_field_errors as string)
			} else if (backendErrors.detail) {
				toastMessage = Array.isArray(backendErrors.detail)
					? backendErrors.detail.join(', ')
					: (backendErrors.detail as string)
			}
			for (const k in backendErrors) {
				if (Object.prototype.hasOwnProperty.call(backendErrors, k)) {
					if (k === 'non_field_errors' || k === 'detail') {
						setError('root.serverError', {
							type: 'server',
							message: Array.isArray(backendErrors[k])
								? backendErrors[k].join(', ')
								: (backendErrors[k] as string),
						})
					} else {
						setError(k as Path<T>, {
							type: 'server',
							message: Array.isArray(backendErrors[k])
								? backendErrors[k].join(', ')
								: (backendErrors[k] as string),
						})
					}
				}
			}
			if (!toastMessage) {
				toastMessage =
					defaultToastMessage || 'Please correct the errors in the form.'
			}
			toast.error(toastMessage)
		} else {
			setError('root.serverError', {
				type: 'server',
				message: err.message || GENERIC_SERVER_ERROR,
			})
			toast.error(err.message || GENERIC_SERVER_ERROR)
		}
	} else {
		setError('root.serverError', {
			type: 'server',
			message: UNEXPECTED_SERVER_ERROR,
		})
		toast.error(UNEXPECTED_SERVER_ERROR)
	}
}

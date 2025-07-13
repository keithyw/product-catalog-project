import axios, { AxiosError } from 'axios'
import { UseFormSetError, Path } from 'react-hook-form'
import { GENERIC_SERVER_ERROR, UNEXPECTED_SERVER_ERROR } from '@/lib/constants'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormFields = Record<string, any>

export function handleFormErrors<T extends FormFields>(
	e: unknown,
	setError: UseFormSetError<T>,
) {
	if (axios.isAxiosError(e)) {
		const err = e as AxiosError
		if (err.response && err.response.data) {
			const backendErrors = err.response.data as Record<
				string,
				string[] | string
			>
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
		} else {
			setError('root.serverError', {
				type: 'server',
				message: err.message || GENERIC_SERVER_ERROR,
			})
		}
	} else {
		setError('root.serverError', {
			type: 'server',
			message: UNEXPECTED_SERVER_ERROR,
		})
	}
}

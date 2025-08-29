'use client'

import { useCallback, useEffect, useState } from 'react'
import { useForm, Resolver, DefaultValues } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { handleFormErrors } from '@/lib/utils/errorHandler'

interface UseEditItemControllerProps<
	T,
	U,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	ZodSchema extends z.ZodObject<any>,
> {
	id: number
	defaultValues?: Partial<z.infer<ZodSchema>>
	getData: (id: number) => Promise<T>
	updateData: (id: number, data: U) => Promise<T>
	errorLoadingMessage: string
	redirectUrl: string
	schema: ZodSchema
	handleFetchCallback: (data: T) => Partial<z.infer<ZodSchema>>
	transformData: (data: z.infer<ZodSchema>) => Promise<U>
}

export function useEditItemController<
	T,
	U,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	ZodSchema extends z.ZodObject<any>,
>({
	id,
	defaultValues,
	getData,
	updateData,
	errorLoadingMessage,
	redirectUrl,
	schema,
	handleFetchCallback,
	transformData,
}: UseEditItemControllerProps<T, U, ZodSchema>) {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)
	const [loadingError, setLoadingError] = useState<string | null>(null)
	const [data, setData] = useState<T | null>(null)
	type SchemaForm = z.infer<ZodSchema>
	const resolver = zodResolver(schema) as unknown as Resolver<SchemaForm>

	const {
		register,
		handleSubmit,
		setError,
		reset,
		formState: { errors, isSubmitting },
		control,
	} = useForm<z.infer<ZodSchema>>({
		resolver: resolver,
		defaultValues: defaultValues as DefaultValues<SchemaForm>,
	})

	const onSubmit = async (form: SchemaForm) => {
		try {
			const payload = await transformData(form)
			const res = await updateData(id, payload)
			setData(res)
			toast.success(`Item updated successfully!`)
			router.push(redirectUrl)
		} catch (e: unknown) {
			handleFormErrors<SchemaForm>(
				e,
				setError,
				'Failed to edit item. Please review your input.',
			)
		}
	}

	const fetchItem = useCallback(async () => {
		setIsLoading(true)
		setLoadingError(null)
		try {
			const res = await getData(id)
			if (res) {
				setData(res)
				const vals = handleFetchCallback(res)
				reset(vals as DefaultValues<SchemaForm>)
			}
		} catch (e: unknown) {
			if (e instanceof Error) {
				setLoadingError(errorLoadingMessage)
				toast.error(errorLoadingMessage)
				console.error(e.message)
				router.push(redirectUrl)
			}
		} finally {
			setIsLoading(false)
		}
	}, [
		errorLoadingMessage,
		getData,
		handleFetchCallback,
		id,
		redirectUrl,
		reset,
		router,
	])

	useEffect(() => {
		void fetchItem()
	}, [fetchItem])

	return {
		data,
		isLoading,
		fieldErrors: errors,
		isSubmitting,
		loadingError,
		register,
		control,
		reset,
		handleSubmit: handleSubmit(onSubmit),
	}
}

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface UseDetailsControllerProps<T> {
	id: number
	deleteData: (id: number) => Promise<void>
	getData: (id: number) => Promise<T>
	redirectUrl: string
	errorLoadingMessage: string
	handleDetailsCallback: (data: T) => void
}

export function useDetailsController<T>({
	id,
	deleteData,
	getData,
	redirectUrl,
	errorLoadingMessage,
	handleDetailsCallback,
}: UseDetailsControllerProps<T>) {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [data, setData] = useState<T | null>(null)
	const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)

	const handleDeleteConfirm = useCallback(async () => {
		if (data) {
			await deleteData(id)
			toast.success(`Item deleted successfully`)
			router.push(redirectUrl)
			try {
			} catch (e: unknown) {
				console.error('Failed deleting item: ', e)
				toast.error(`Failed to delete item`)
				setIsConfirmationModalOpen(false)
			}
		}
	}, [data, deleteData, id, redirectUrl, router])

	const handleEditClick = useCallback(() => {
		if (data) {
			router.push(`${redirectUrl}/${id}/edit`)
		}
	}, [data, id, redirectUrl, router])

	const fetchItem = useCallback(async () => {
		setIsLoading(true)
		setError(null)
		try {
			const res = await getData(id)
			if (res) {
				setData(res)
				handleDetailsCallback(res)
			}
		} catch (e: unknown) {
			if (e instanceof Error) {
				setError(errorLoadingMessage)
				console.error(e.message)
				router.push(redirectUrl)
			}
		} finally {
			setIsLoading(false)
		}
	}, [
		errorLoadingMessage,
		getData,
		handleDetailsCallback,
		id,
		redirectUrl,
		router,
	])

	useEffect(() => {
		void fetchItem()
	}, [fetchItem])

	return {
		data,
		isLoading,
		error,
		handleDeleteConfirm,
		handleEditClick,
		isConfirmationModalOpen,
		setIsConfirmationModalOpen,
	}
}

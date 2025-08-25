import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { ListResponse } from '@/types/list'

interface HasId {
	id: string | number
}

interface UseMultiSelectModalControllerProps<T extends HasId> {
	defaultPageSize?: number
	fetchData: (
		page: number,
		pageSize: number,
		searchTerm?: string,
		orderBy?: string,
	) => Promise<ListResponse<T>>
	onSelectCallback?: (selectedItems: T[]) => void
	onRemoveCallback?: (selectedItems: T[]) => void
}

export function useMultiSelectModalController<T extends HasId>({
	defaultPageSize = DEFAULT_PAGE_SIZE,
	fetchData,
	onSelectCallback,
	onRemoveCallback,
}: UseMultiSelectModalControllerProps<T>) {
	const [isLoading, setIsLoading] = useState(false)
	const [loadingErrors, setLoadingErrors] = useState<string | null>(null)
	const [data, setData] = useState<T[]>([])
	const [selectedData, setSelectedData] = useState<T[]>([])

	const fetchItems = useCallback(async () => {
		setIsLoading(true)
		setLoadingErrors(null)
		try {
			const res = await fetchData(1, defaultPageSize)
			if (res) {
				setData(res.results)
			}
		} catch (e: unknown) {
			if (e instanceof Error) {
				setLoadingErrors(e.message)
				console.error(e.message)
			}
		} finally {
			setIsLoading(false)
		}
	}, [defaultPageSize, fetchData])

	useEffect(() => {
		void fetchItems()
	}, [fetchItems])

	const onSelectItem = useCallback(
		(item: T) => {
			setSelectedData((prev) => {
				if (!prev.find((i) => i.id === item.id)) {
					const newSelectedItems = [...prev, item]
					if (onSelectCallback) {
						onSelectCallback(newSelectedItems)
					}
					return newSelectedItems
				}
				return prev
			})
		},
		[onSelectCallback],
	)

	const onRemoveItem = useCallback(
		(item: T) => {
			setSelectedData((prev) => {
				const updatedItems = prev.filter((i) => i.id !== item.id)
				if (onRemoveCallback) {
					onRemoveCallback(updatedItems)
				}
				return updatedItems
			})
		},
		[onRemoveCallback],
	)

	return {
		data,
		selectedData,
		setSelectedData,
		loadingErrors,
		isLoading,
		onSelectItem,
		onRemoveItem,
	}
}

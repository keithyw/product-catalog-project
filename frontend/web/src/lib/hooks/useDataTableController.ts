import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { ListResponse } from '@/types/list'

interface UseDataTableControllerProps<T> {
	initialSortField?: string
	initSortDirection?: 'asc' | 'desc'
	defaultPageSize?: number
	fetchData: (
		page: number,
		pageSize: number,
		searchTerm?: string,
		orderBy?: string,
	) => Promise<ListResponse<T>>
}

export function useDataTableController<T>({
	initialSortField,
	initSortDirection = 'asc',
	defaultPageSize = DEFAULT_PAGE_SIZE,
	fetchData,
}: UseDataTableControllerProps<T>) {
	const [searchTerm, setSearchTerm] = useState('')
	const [currentPage, setCurrentPage] = useState(1)
	const [pageSize, setPageSize] = useState(defaultPageSize)
	const [totalCount, setTotalCount] = useState(0)
	const [sortField, setSortField] = useState<string | undefined>(
		initialSortField,
	)
	const [sortDirection, setSortDirection] = useState<
		'asc' | 'desc' | undefined
	>(initSortDirection)
	const [data, setData] = useState<T[]>([])
	const [isLoading, setIsLoading] = useState(false)

	const loadData = useCallback(async () => {
		setIsLoading(true)
		try {
			let orderBy: string | undefined
			if (sortField && sortDirection) {
				orderBy = sortDirection === 'asc' ? sortField : `-${sortField}`
			}
			const res = await fetchData(currentPage, pageSize, searchTerm, orderBy)
			if (res) {
				setData(res.results)
				setTotalCount(res.count)
			}
		} catch (e: unknown) {
			if (e instanceof Error) {
				toast.error(`Failed loading data: ${e.message}`)
				console.error(e.message)
			}
		} finally {
			setIsLoading(false)
		}
	}, [currentPage, pageSize, searchTerm, sortField, sortDirection, fetchData])

	useEffect(() => {
		void loadData()
	}, [loadData])

	const handleSearch = useCallback((term: string) => {
		setSearchTerm(term)
		setCurrentPage(1)
	}, [])

	const handlePageChange = useCallback((page: number) => {
		setCurrentPage(page)
	}, [])

	const handlePageSizeChange = useCallback((size: number) => {
		setPageSize(size)
		setCurrentPage(1)
	}, [])

	const handleSort = useCallback(
		(f: string) => {
			let newDirection: 'asc' | 'desc' = 'asc'
			if (sortField === f) {
				newDirection = sortDirection === 'asc' ? 'desc' : 'asc'
			}
			setSortField(f)
			setSortDirection(newDirection)
			setCurrentPage(1)
		},
		[sortField, sortDirection],
	)

	return {
		data,
		isLoading,
		searchTerm,
		totalCount,
		currentPage,
		pageSize,
		sortField,
		sortDirection,
		handleSearch,
		handlePageChange,
		handlePageSizeChange,
		handleSort,
		loadData,
	}
}

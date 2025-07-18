export interface ListResponse<T> {
	results: T[]
	count: number
	next: number | null
	previous: number | null
}

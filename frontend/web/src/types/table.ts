export interface TableColumn<T> {
	header: string
	accessor?: keyof T
	render?: (row: T) => React.ReactNode
}

export interface TableRowAction<T> {
	label: string
	onClick: (row: T) => void
	className?: string
}

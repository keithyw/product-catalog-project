export interface TableColumn<T> {
	header: string
	accessor?: keyof T
	render?: (row: T) => React.ReactNode
	sortable?: boolean
	sortField?: string
}

export type TableRowActionType = 'view' | 'edit' | 'delete' | 'custom'

export interface TableRowAction<T> {
	label: string
	onClick: (row: T) => void
	actionType?: TableRowActionType // For default icon mapping
	icon?: React.ReactNode // Optional explicit icon (Heroicon component)
	className?: string
}

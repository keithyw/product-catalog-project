export interface TableColumn<T> {
	header: string
	accessor?: keyof T
	render?: (row: T) => React.ReactNode
	sortable?: boolean
	sortField?: string
}

export type TableRowActionType =
	| 'view'
	| 'edit'
	| 'delete'
	| 'userGroup'
	| 'permissionGroup'
	| 'custom'

export interface TableRowAction<T> {
	label: string
	onClick: (row: T) => void
	actionType?: TableRowActionType // For default icon mapping
	icon?: React.ReactNode // Optional explicit icon (Heroicon component)
	className?: string
	// Permission requirements
	requiredPermission?: string
	requiredPermissions?: string[] // Requires ALL permissions
	anyPermission?: string[] // Requires ANY of these permissions
	requiredGroup?: string
	requiredGroups?: string[] // Requires ALL groups
	anyGroup?: string[] // Requires ANY of these groups
	requireStaff?: boolean
	requireActive?: boolean
}

export interface Permission {
	id: number
	name: string
	codename: string
	content_type: number
}

export interface PermissionsResponse {
	count: number
	next: string | null
	previous: string | null
	results: Permission[]
}

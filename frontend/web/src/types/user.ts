export interface User {
	id: string
	username: string
	email: string
	first_name: string
	last_name: string
	is_staff: boolean
	is_active: boolean
	date_joined: string
	last_login: string | null
}
export interface CreateUserRequest {
	username: string
	email: string
	first_name?: string
	last_name?: string
	password: string
	password_confirm: string
}

export interface UpdateUserRequest {
	first_name?: string
	last_name?: string
	is_staff?: boolean
	is_active?: boolean
}
export interface UsersResponse {
	results: User[]
	count: number
	next: number | null
	previous: number | null
}

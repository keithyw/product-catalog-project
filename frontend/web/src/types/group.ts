import { Permission } from '@/types/permission'

export interface Group {
	id: number
	name: string
	permissions?: Permission[]
}

export interface CreateGroupRequest {
	name: string
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateGroupRequest extends CreateGroupRequest {}

export interface GroupsResponse {
	count: number
	next: string | null
	previous: string | null
	results: Group[]
}

export interface Asset {
	id: number
	url: string
	name?: string
	type: string
	filepath?: string
	extension?: string
	dimensions?: string
	description?: string
}

export interface CreateAssetRequest {
	url: string
	name?: string
	type: string
	filepath?: string
	extension?: string
	dimensions?: string | null
	description?: string
}

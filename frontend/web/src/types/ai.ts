export interface SimpleBrand {
	id?: number
	name: string
	description: string
}

// export interface ErrorResponseDetail {
// 	original_error: string
// 	entity_type: string
// }

export interface GenerateBrandResponse {
	status: string
	entity_type: string
	data: SimpleBrand[]
	// message?: string
	// details?: ErrorResponseDetail
}

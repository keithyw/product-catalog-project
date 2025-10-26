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
	url?: string
	name?: string
	type: string
	filepath?: string
	extension?: string
	dimensions?: string | null
	description?: string
}

export interface CreateAssetFromFileRequest
	extends Omit<CreateAssetRequest, 'url' | 'extension' | 'dimension'> {
	file: File
}

export interface AssetAssociation {
	id: number
	asset: number
	entity: string
	entity_id: number
}

export interface CreateAssetAssociationRequest {
	asset: number
	entity: string
	entity_id: number
}

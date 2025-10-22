import axiosClient from '@/lib/clients/axiosClient'
import { API_ASSET_ASSOCIATIONS_URL } from '@/lib/constants'
import { AssetAssociation, CreateAssetAssociationRequest } from '@/types/asset'
import { FilterParams } from '@/types/filters'
import { ListResponse } from '@/types/list'
import { PaginationParams } from '@/types/pagination'

interface AssetAssociationService {
	create: (data: CreateAssetAssociationRequest) => Promise<AssetAssociation>
	delete: (id: number) => Promise<void>
	fetch: (
		page?: number,
		pageSize?: number,
		searchTerm?: string,
		ordering?: string,
		filters?: FilterParams,
	) => Promise<ListResponse<AssetAssociation>>
	get: (id: number) => Promise<AssetAssociation>
	update: (
		id: number,
		data: CreateAssetAssociationRequest,
	) => Promise<AssetAssociation>
}

const assetAssociationService: AssetAssociationService = {
	create: async (
		data: CreateAssetAssociationRequest,
	): Promise<AssetAssociation> => {
		const res = await axiosClient.post<AssetAssociation>(
			API_ASSET_ASSOCIATIONS_URL,
			data,
		)
		return res.data || ({} as AssetAssociation)
	},
	delete: async (id: number): Promise<void> => {
		await axiosClient.delete(`${API_ASSET_ASSOCIATIONS_URL}${id}/`)
		return
	},
	fetch: async (
		page?: number,
		pageSize?: number,
		searchTerm?: string,
		ordering?: string,
		filters?: FilterParams,
	): Promise<ListResponse<AssetAssociation>> => {
		const params: PaginationParams & FilterParams = {
			page,
			page_size: pageSize,
			...(filters || {}),
		}
		if (searchTerm) params.search = searchTerm
		if (ordering) params.ordering = ordering
		Object.keys(params).forEach((k) =>
			params[k] === undefined ? delete params[k] : {},
		)
		const res = await axiosClient.get<ListResponse<AssetAssociation>>(
			API_ASSET_ASSOCIATIONS_URL,
			{
				params,
			},
		)
		return res.data || { results: [], count: 0, next: null, previous: null }
	},
	get: async (id: number): Promise<AssetAssociation> => {
		const res = await axiosClient.get<AssetAssociation>(
			`${API_ASSET_ASSOCIATIONS_URL}${id}/`,
		)
		return res.data || ({} as AssetAssociation)
	},
	update: async (
		id: number,
		data: CreateAssetAssociationRequest,
	): Promise<AssetAssociation> => {
		const res = await axiosClient.put<AssetAssociation>(
			`${API_ASSET_ASSOCIATIONS_URL}${id}/`,
			data,
		)
		return res.data || ({} as AssetAssociation)
	},
}

export default assetAssociationService

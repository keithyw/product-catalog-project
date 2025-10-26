import axiosClient from '@/lib/clients/axiosClient'
import { API_ASSETS_URL } from '@/lib/constants'
import {
	Asset,
	CreateAssetRequest,
	CreateAssetFromFileRequest,
} from '@/types/asset'
import { ListResponse } from '@/types/list'
import { PaginationParams } from '@/types/pagination'

interface AssetService {
	create: (data: CreateAssetRequest) => Promise<Asset>
	createWithFile: (data: CreateAssetFromFileRequest) => Promise<Asset>
	delete: (id: number) => Promise<void>
	fetch: (
		page?: number,
		pageSize?: number,
		searchTerm?: string,
		ordering?: string,
	) => Promise<ListResponse<Asset>>
	get: (id: number) => Promise<Asset>
	update: (id: number, data: CreateAssetRequest) => Promise<Asset>
}

const assetService: AssetService = {
	create: async (data: CreateAssetRequest): Promise<Asset> => {
		const res = await axiosClient.post<Asset>(API_ASSETS_URL, data)
		return res.data || ({} as Asset)
	},
	createWithFile: async (data: CreateAssetFromFileRequest): Promise<Asset> => {
		const formData = new FormData()
		formData.append('file', data.file, data.file.name)
		formData.append('type', data.type)
		if (data.name) formData.append('name', data.name)
		if (data.description) formData.append('description', data.description)
		const res = await axiosClient.post<Asset>(API_ASSETS_URL, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		})
		return res.data || ({} as Asset)
	},
	delete: async (id: number): Promise<void> => {
		await axiosClient.delete(`${API_ASSETS_URL}${id}/`)
		return
	},
	fetch: async (
		page?: number,
		pageSize?: number,
		searchTerm?: string,
		ordering?: string,
	): Promise<ListResponse<Asset>> => {
		const params: PaginationParams = { page, page_size: pageSize }
		if (searchTerm) params.search = searchTerm
		if (ordering) params.ordering = ordering
		const res = await axiosClient.get<ListResponse<Asset>>(API_ASSETS_URL, {
			params,
		})
		return res.data || { results: [], count: 0, next: null, previous: null }
	},
	get: async (id: number): Promise<Asset> => {
		const res = await axiosClient.get<Asset>(`${API_ASSETS_URL}${id}/`)
		return res.data || ({} as Asset)
	},
	update: async (id: number, data: CreateAssetRequest): Promise<Asset> => {
		const res = await axiosClient.put<Asset>(`${API_ASSETS_URL}${id}/`, data)
		return res.data || ({} as Asset)
	},
}

export default assetService

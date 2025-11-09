import axiosClient from '@/lib/clients/axiosClient'
import { API_PRICE_URL } from '@/lib/constants'
import { CreatePriceRequest, Price } from '@/types/product'

interface PriceService {
	create: (data: CreatePriceRequest) => Promise<Price>
	patch: (id: number, data: Partial<CreatePriceRequest>) => Promise<Price>
}

const priceService: PriceService = {
	create: async (data: CreatePriceRequest): Promise<Price> => {
		const res = await axiosClient.post<Price>(`${API_PRICE_URL}`, data)
		return res.data || ({} as Price)
	},
	patch: async (
		id: number,
		data: Partial<CreatePriceRequest>,
	): Promise<Price> => {
		const res = await axiosClient.patch<Price>(`${API_PRICE_URL}${id}/`, data)
		return res.data || ({} as Price)
	},
}

export default priceService

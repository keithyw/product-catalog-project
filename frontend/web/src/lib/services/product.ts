import axiosClient from '@/lib/clients/axiosClient'
import { API_PRODUCT_URL } from '@/lib/constants'
import { ProductsResponse } from '@/types/product'

interface ProductService {
	getProducts: () => Promise<ProductsResponse>
}

const productService: ProductService = {
	getProducts: async (): Promise<ProductsResponse> => {
		const r = await axiosClient.get<ProductsResponse>(API_PRODUCT_URL)
		return r.data || { results: [], count: 0, next: null, previous: null }
	},
}

export default productService

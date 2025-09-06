import { AxiosError } from 'axios'
import axiosClient from '@/lib/clients/axiosClient'
import { API_PRODUCT_IMAGE_URL } from '@/lib/constants'
import { AIServiceException } from '@/lib/services/aiTools'
import { GeneratedProductResponse } from '@/types/product'

interface ProductImageService {
	generate: (
		productType: string,
		prompt: string,
		image: Blob,
	) => Promise<GeneratedProductResponse>
}

const productImageService: ProductImageService = {
	generate: async (
		productType: string,
		prompt: string,
		image: Blob,
	): Promise<GeneratedProductResponse> => {
		const form = new FormData()
		form.append('prompt', prompt)
		form.append('product_type', productType)
		form.append('file', image)
		try {
			const res = await axiosClient.post(API_PRODUCT_IMAGE_URL, form, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			})
			return res.data || ({} as GeneratedProductResponse)
		} catch (e: unknown) {
			if (e instanceof AxiosError) {
				if (e.response) {
					throw new AIServiceException(
						e.response.data.message,
						e.response.status,
					)
				}
			}
		}
		throw new AIServiceException('Unknown error', 500)
	},
}

export default productImageService

import axiosClient from '@/lib/clients/axiosClient'
import {
	API_AI_TOOLS_GENERATE_URL,
	ENTITY_BRAND,
	ENTITY_CATEGORY,
	ENTITY_PRODUCT_ATTRIBUTE,
} from '@/lib/constants'
import {
	GeneratedResponse,
	SimpleBrand,
	SimpleCategory,
	SimpleProductAttribute,
} from '@/types/ai'
import { AxiosError } from 'axios'

export class AIServiceException extends Error {
	status: number

	constructor(message: string, status: number) {
		super(message)
		this.status = status
		Object.setPrototypeOf(this, AIServiceException.prototype)
	}
}
interface AIToolsService<T> {
	generateBrands: (prompt: string) => Promise<GeneratedResponse<SimpleBrand>>
	generateCategories: (
		prompt: string,
	) => Promise<GeneratedResponse<SimpleCategory>>
	generateProductAttributes: (
		prompt: string,
	) => Promise<GeneratedResponse<SimpleProductAttribute>>
	generateByType: (
		prompt: string,
		entityType: string,
	) => Promise<GeneratedResponse<T>>
}

const aiToolsService: AIToolsService<
	SimpleBrand | SimpleCategory | SimpleProductAttribute
> = {
	generateBrands: async (
		prompt: string,
	): Promise<GeneratedResponse<SimpleBrand>> => {
		try {
			const res = await axiosClient.post<GeneratedResponse<SimpleBrand>>(
				API_AI_TOOLS_GENERATE_URL,
				{
					prompt: prompt,
					entity_type: ENTITY_BRAND,
				},
			)
			return res.data
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
	generateCategories: async (
		prompt: string,
	): Promise<GeneratedResponse<SimpleCategory>> => {
		try {
			const res = await axiosClient.post<GeneratedResponse<SimpleCategory>>(
				API_AI_TOOLS_GENERATE_URL,
				{
					prompt: prompt,
					entity_type: ENTITY_CATEGORY,
				},
			)
			return res.data
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
	generateProductAttributes: async (
		prompt: string,
	): Promise<GeneratedResponse<SimpleProductAttribute>> => {
		try {
			const res = await axiosClient.post<
				GeneratedResponse<SimpleProductAttribute>
			>(API_AI_TOOLS_GENERATE_URL, {
				prompt: prompt,
				entity_type: ENTITY_PRODUCT_ATTRIBUTE,
			})
			return res.data
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
	generateByType: async (
		prompt: string,
		entityType: string,
	): Promise<
		GeneratedResponse<SimpleBrand | SimpleCategory | SimpleProductAttribute>
	> => {
		const allowedTypes = [
			ENTITY_BRAND,
			ENTITY_CATEGORY,
			ENTITY_PRODUCT_ATTRIBUTE,
		]
		if (!allowedTypes.includes(entityType)) {
			throw new AIServiceException('Invalid entity type', 400)
		}
		switch (entityType) {
			case ENTITY_BRAND:
				return aiToolsService.generateBrands(prompt)
			case ENTITY_CATEGORY:
				return aiToolsService.generateCategories(prompt)
			case ENTITY_PRODUCT_ATTRIBUTE:
				return aiToolsService.generateProductAttributes(prompt)
		}
		throw new AIServiceException('Unknown error', 500)
	},
}

export default aiToolsService

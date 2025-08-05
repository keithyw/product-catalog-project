import axiosClient from '@/lib/clients/axiosClient'
import { API_AI_TOOLS_GENERATE_URL, ENTITY_BRAND } from '@/lib/constants'
import { GenerateBrandResponse } from '@/types/ai'
import { AxiosError } from 'axios'

interface AIToolsService {
	generateBrands: (prompt: string) => Promise<GenerateBrandResponse>
}

export class AIServiceException extends Error {
	status: number

	constructor(message: string, status: number) {
		super(message)
		this.status = status

		Object.setPrototypeOf(this, AIServiceException.prototype)
	}
}

const aiToolsService: AIToolsService = {
	generateBrands: async (prompt: string): Promise<GenerateBrandResponse> => {
		try {
			const res = await axiosClient.post<GenerateBrandResponse>(
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
}

export default aiToolsService

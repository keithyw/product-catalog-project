import inventoryService from './inventory'
import axiosClient from '@/lib/clients/axiosClient'
import { API_INVENTORY_URL } from '@/lib/constants'

// Mock axiosClient
jest.mock('@/lib/clients/axiosClient')

describe('inventoryService', () => {
	const mockAxios = axiosClient as jest.Mocked<typeof axiosClient>

	beforeEach(() => {
		jest.clearAllMocks()
	})

	describe('create', () => {
		it('should create an inventory item', async () => {
			const mockData = {
				product: 1,
				sku: '123',
				quantity: 10,
				reserved: 0,
				low_stock_threshold: 5,
				is_active: true,
			}
			const mockResponse = { id: 1, ...mockData }
			mockAxios.post.mockResolvedValue({ data: mockResponse })

			const result = await inventoryService.create(mockData)

			expect(mockAxios.post).toHaveBeenCalledWith(API_INVENTORY_URL, mockData)
			expect(result).toEqual(mockResponse)
		})
	})

	describe('delete', () => {
		it('should delete an inventory item', async () => {
			mockAxios.delete.mockResolvedValue({ data: {} })

			await inventoryService.delete(1)

			expect(mockAxios.delete).toHaveBeenCalledWith(`${API_INVENTORY_URL}1/`)
		})
	})

	describe('fetch', () => {
		it('should fetch inventory items with parameters', async () => {
			const mockResponse = { results: [], count: 0 }
			mockAxios.get.mockResolvedValue({ data: mockResponse })

			const result = await inventoryService.fetch(1, 10, 'search', 'ordering')

			expect(mockAxios.get).toHaveBeenCalledWith(API_INVENTORY_URL, {
				params: {
					page: 1,
					page_size: 10,
					search: 'search',
					ordering: 'ordering',
				},
			})
			expect(result).toEqual(mockResponse)
		})

		it('should handle empty response', async () => {
			mockAxios.get.mockResolvedValue({ data: null })
			const result = await inventoryService.fetch()
			expect(result).toEqual({
				results: [],
				count: 0,
				next: null,
				previous: null,
			})
		})
	})

	describe('get', () => {
		it('should get a single inventory item', async () => {
			const mockResponse = { id: 1, sku: '123' }
			mockAxios.get.mockResolvedValue({ data: mockResponse })

			const result = await inventoryService.get(1)

			expect(mockAxios.get).toHaveBeenCalledWith(`${API_INVENTORY_URL}1/`)
			expect(result).toEqual(mockResponse)
		})
	})

	describe('patch', () => {
		it('should patch an inventory item', async () => {
			const mockData = { quantity: 20 }
			const mockResponse = { id: 1, sku: '123', quantity: 20 }
			mockAxios.patch.mockResolvedValue({ data: mockResponse })

			const result = await inventoryService.patch(1, mockData)

			expect(mockAxios.patch).toHaveBeenCalledWith(
				`${API_INVENTORY_URL}1/`,
				mockData,
			)
			expect(result).toEqual(mockResponse)
		})
	})
})

import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { API_PRODUCT_URL } from '@/lib/constants'
import axiosClient from '@/lib/clients/axiosClient'
import productService from '@/lib/services/product'

const mock = new MockAdapter(axiosClient)

describe('productService', () => {
	let consoleErrorSpy: jest.SpyInstance

	beforeEach(() => {
		consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
	})

	afterEach(() => {
		mock.reset()
		consoleErrorSpy.mockRestore()
	})

	describe('getProducts', () => {
		it('should fetch products successfully', async () => {
			const mockResponse = {
				results: [
					{ id: 1, name: 'Product 1', description: 'Desc 1' },
					{ id: 2, name: 'Product 2', description: 'Desc 2' },
				],
				count: 2,
				next: null,
				previous: null,
			}

			mock.onGet(API_PRODUCT_URL).reply(200, mockResponse)
			const response = await productService.fetch(0, 10)
			expect(response).toEqual(mockResponse)
			expect(mock.history.get.length).toBe(1)
			expect(mock.history.get[0].url).toBe('/products/')
			expect(mock.history.get[0].params).toStrictEqual({
				page: 0,
				page_size: 10,
			})
		})

		it('should handle errors gracefully', async () => {
			mock.onGet(API_PRODUCT_URL).reply(500)
			await expect(productService.fetch()).rejects.toThrow(axios.AxiosError)
			expect(mock.history.get.length).toBe(1)
			expect(consoleErrorSpy).toHaveBeenCalled()
		})
	})
})

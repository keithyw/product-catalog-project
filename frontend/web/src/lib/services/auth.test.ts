import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { API_REFRESH_URL, API_TOKEN_URL } from '@/lib/constants'
import axiosClient from '@/lib/clients/axiosClient'
import authService from '@/lib/services/auth'

const mock = new MockAdapter(axiosClient)
const axiosMock = new MockAdapter(axios)

describe('authService', () => {
	let consoleErrorSpy: jest.SpyInstance

	beforeEach(() => {
		consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
		mock.reset()
		axiosMock.reset()
	})

	afterEach(() => {
		consoleErrorSpy.mockRestore()
	})

	describe('login', () => {
		it('should login successfully', async () => {
			const mockResponse = {
				access: 'access_token',
				refresh: 'refresh_token',
			}

			mock.onPost(API_TOKEN_URL).reply(200, mockResponse)
			axiosMock
				.onPost(API_REFRESH_URL)
				.reply(200, { access: 'new_access', refresh: 'new_refresh' })
			const response = await authService.login('testuser', 'testpassword')
			expect(response).toEqual(mockResponse)
			expect(mock.history.post.length).toBe(1)
			expect(mock.history.post[0].url).toBe(API_TOKEN_URL)
			expect(mock.history.post[0].data).toEqual(
				JSON.stringify({ username: 'testuser', password: 'testpassword' }),
			)
		})

		it('should handle invalid credentials', async () => {
			const mockErrorResponse = {
				detail: 'No active account found with the given credentials',
			}
			mock.onPost(API_TOKEN_URL).reply(401, mockErrorResponse)
			axiosMock
				.onPost(API_REFRESH_URL)
				.reply(401, { detail: 'Token refresh failed' })
			await expect(authService.login('baduser', 'badpassword')).rejects.toThrow(
				axios.AxiosError,
			)
			await expect(
				authService.login('baduser', 'badpassword'),
			).rejects.toHaveProperty('response.status', 401)
			await expect(
				authService.login('baduser', 'badpassword'),
			).rejects.toHaveProperty('response.data.detail', mockErrorResponse.detail)
		})
	})
})

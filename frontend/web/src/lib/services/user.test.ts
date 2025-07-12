import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import axiosClient from '@/lib/clients/axiosClient'
import { API_USERS_URL } from '@/lib/constants'
// import { UsersResponse } from '@/types/user'
import userService from '@/lib/services/user'

const mock = new MockAdapter(axiosClient)

describe('userService', () => {
	let consoleErrorSpy: jest.SpyInstance

	beforeEach(() => {
		consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
	})

	afterEach(() => {
		mock.reset()
		consoleErrorSpy.mockRestore()
	})

	describe('userService', () => {
		describe('getUsers', () => {
			it('should fetch users successfully', async () => {
				const mockResponse = {
					results: [
						{
							id: 1,
							username: 'test1',
							email: 'test1@test.com',
							first_name: 'test_first1',
							last_name: 'test_last1',
							is_staff: true,
							is_active: true,
						},
						{
							id: 2,
							username: 'test2',
							email: 'test2@test.com',
							first_name: 'test_first2',
							last_name: 'test_last2',
							is_staff: false,
							is_active: true,
						},
					],
					count: 2,
					next: null,
					previous: null,
				}
				mock.onGet(API_USERS_URL).reply(200, mockResponse)
				const response = await userService.getUsers()
				expect(response).toEqual(mockResponse)
				expect(mock.history.get.length).toBe(1)
				expect(mock.history.get[0].url).toBe(API_USERS_URL)
				expect(mock.history.get[0].params).toBeUndefined()
				expect(mock.history.get[0].params).toBeUndefined()
			})

			it('should handle errors gracefully', async () => {
				mock.onGet(API_USERS_URL).reply(500)
				await expect(userService.getUsers()).rejects.toThrow(axios.AxiosError)
				expect(mock.history.get.length).toBe(1)
				expect(consoleErrorSpy).toHaveBeenCalled()
			})
		})
	})
})

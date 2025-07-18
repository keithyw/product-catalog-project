import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import axiosClient from '@/lib/clients/axiosClient'
import { API_USERS_URL, API_CURRENT_USER_URL } from '@/lib/constants'
import { Group } from '@/types/group'
import { User } from '@/types/user'
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
		describe('createUser', () => {
			it('should create a user successfully', async () => {
				const mockResponse = {
					id: 1,
					username: 'testuser',
					email: 'test@test.com',
					first_name: 'test_first',
					last_name: 'test_last',
					is_active: true,
					is_staff: false,
					date_joined: '2025-07-12T18:08:35.770625Z',
					last_login: null,
				}
				mock.onPost(API_USERS_URL).reply(201, mockResponse)
				const response = await userService.createUser({
					username: 'testuser',
					password: 'test',
					password_confirm: 'test',
					first_name: 'test_first',
					last_name: 'test_last',
					email: 'test@test.com',
				})
				expect(response).toEqual(mockResponse)
				expect(mock.history.post.length).toBe(1)
				expect(mock.history.post[0].url).toBe(API_USERS_URL)
				expect(mock.history.post[0].data).toEqual(
					JSON.stringify({
						username: 'testuser',
						password: 'test',
						password_confirm: 'test',
						first_name: 'test_first',
						last_name: 'test_last',
						email: 'test@test.com',
					}),
				)
			})

			it('should handle errors gracefully', async () => {
				mock.onPost(API_USERS_URL).reply(500)
				await expect(
					userService.createUser({
						username: 'testuser',
						password: 'test',
						password_confirm: 'test',
						first_name: 'test_first',
						last_name: 'test_last',
						email: 'test@test.com',
					}),
				).rejects.toThrow(axios.AxiosError)
				expect(mock.history.post.length).toBe(1)
				expect(consoleErrorSpy).toHaveBeenCalled()
			})
		})

		describe('deleteUser', () => {
			it('should delete a user successfully', async () => {
				mock.onDelete(`${API_USERS_URL}1/`).reply(204) // 204 No Content for successful deletion
				await userService.deleteUser(1)
				expect(mock.history.delete.length).toBe(1)
				expect(mock.history.delete[0].url).toBe(`${API_USERS_URL}1/`)
			})

			it('should handle deletion error', async () => {
				mock.onDelete(`${API_USERS_URL}1/`).reply(404)
				await expect(userService.deleteUser(1)).rejects.toThrow(
					axios.AxiosError,
				)
				expect(mock.history.delete.length).toBe(1)
			})
		})

		describe('getUser', () => {
			it('should fetch a user successfully', async () => {
				const mockResponse = {
					id: 1,
					username: 'testuser',
					email: 'test@test.com',
					first_name: 'test_first',
					last_name: 'test_last',
					is_active: true,
					is_staff: false,
					date_joined: '2025-07-12T18:08:35.770625Z',
					last_login: null,
				}
				mock.onGet(`${API_USERS_URL}1/`).reply(200, mockResponse)
				const response = await userService.getUser(1)
				expect(response).toEqual(mockResponse)
				expect(mock.history.get.length).toBe(1)
				expect(mock.history.get[0].url).toBe(`${API_USERS_URL}1/`)
				expect(mock.history.get[0].params).toBeUndefined()
			})
			it('should not find a user', async () => {
				mock.onGet(`${API_USERS_URL}1/`).reply(404)
				await expect(userService.getUser(1)).rejects.toThrow(axios.AxiosError)
			})
		})

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
				expect(mock.history.get[0].params).toStrictEqual({
					page: undefined,
					page_size: undefined,
				})
			})

			it('should handle errors gracefully', async () => {
				mock.onGet(API_USERS_URL).reply(500)
				await expect(userService.getUsers()).rejects.toThrow(axios.AxiosError)
				expect(mock.history.get.length).toBe(1)
				expect(consoleErrorSpy).toHaveBeenCalled()
			})
		})

		describe('updateUser', () => {
			it('should update a user successfully', async () => {
				const mockResponse = {
					id: 1,
					username: 'testuser',
					email: 'test@test.com',
					first_name: 'test_first',
					last_name: 'test_last',
					is_active: true,
					is_staff: false,
					date_joined: '2025-07-12T18:08:35.770625Z',
					last_login: null,
				}
				mock.onPut(`${API_USERS_URL}1/`).reply(200, mockResponse)
				const response = await userService.updateUser(1, {
					first_name: 'test_first',
					last_name: 'test_last',
					is_staff: false,
					is_active: true,
				})
				expect({
					...response,
					id: 1,
					username: 'testuser',
					email: 'test@test.com',
					date_joined: '2025-07-12T18:08:35.770625Z',
					last_login: null,
				}).toEqual(mockResponse)
				expect(mock.history.put.length).toBe(1)
				expect(mock.history.put[0].url).toBe(`${API_USERS_URL}1/`)
				expect(mock.history.put[0].data).toEqual(
					JSON.stringify({
						first_name: 'test_first',
						last_name: 'test_last',
						is_staff: false,
						is_active: true,
					}),
				)
			})
			it('should not find a user to update', async () => {
				mock.onPut(`${API_USERS_URL}1/`).reply(404)
				await expect(
					userService.updateUser(1, {
						first_name: 'test_first',
						last_name: 'test_last',
						is_staff: false,
						is_active: true,
					}),
				).rejects.toThrow(axios.AxiosError)
				expect(mock.history.put.length).toBe(1)
				expect(consoleErrorSpy).toHaveBeenCalled()
			})
			it('should handle errors gracefully', async () => {
				mock.onPut(`${API_USERS_URL}1/`).reply(500)
				await expect(
					userService.updateUser(1, {
						first_name: 'test_first',
						last_name: 'test_last',
						is_staff: false,
						is_active: true,
					}),
				).rejects.toThrow(axios.AxiosError)
				expect(mock.history.put.length).toBe(1)
				expect(consoleErrorSpy).toHaveBeenCalled()
			})
		})

		describe('getCurrentUser', () => {
			it('should fetch the current user successfully', async () => {
				const mockCurrentUser: User = {
					id: '1',
					username: 'loggedinuser',
					email: 'loggedin@example.com',
					first_name: 'Logged',
					last_name: 'In',
					is_active: true,
					is_staff: false,
					date_joined: '2025-01-01T00:00:00Z',
					last_login: '2025-07-14T00:00:00Z',
					groups: [],
				}
				mock.onGet(API_CURRENT_USER_URL).reply(200, mockCurrentUser)

				const response = await userService.getCurrentUser()

				expect(response).toEqual(mockCurrentUser)
				expect(mock.history.get.length).toBe(1)
				expect(mock.history.get[0].url).toBe(API_CURRENT_USER_URL)
			})

			it('should handle errors gracefully when fetching current user', async () => {
				mock.onGet(API_CURRENT_USER_URL).reply(401) // e.g., unauthorized

				await expect(userService.getCurrentUser()).rejects.toThrow(
					axios.AxiosError,
				)
				expect(mock.history.get.length).toBe(1)
				expect(consoleErrorSpy).toHaveBeenCalled()
			})
		})

		describe('updateCurrentUser', () => {
			it('should update the current user successfully', async () => {
				const updatedData = {
					first_name: 'UpdatedFirst',
					last_name: 'UpdatedLast',
					email: 'updated@example.com',
				}
				const mockUpdatedUser: User = {
					id: '1',
					username: 'loggedinuser',
					email: 'updated@example.com',
					first_name: 'UpdatedFirst',
					last_name: 'UpdatedLast',
					is_active: true,
					is_staff: false,
					date_joined: '2025-01-01T00:00:00Z',
					last_login: '2025-07-14T00:00:00Z',
					groups: [],
				}
				mock.onPut(API_CURRENT_USER_URL).reply(200, mockUpdatedUser)

				const response = await userService.updateCurrentUser(updatedData)

				expect(response).toEqual(mockUpdatedUser)
				expect(mock.history.put.length).toBe(1)
				expect(mock.history.put[0].url).toBe(API_CURRENT_USER_URL)
				expect(mock.history.put[0].data).toEqual(JSON.stringify(updatedData))
			})

			it('should handle errors gracefully when updating current user', async () => {
				const updatedData = {
					first_name: 'UpdatedFirst',
					last_name: 'UpdatedLast',
					email: 'updated@example.com',
				}
				mock.onPut(API_CURRENT_USER_URL).reply(400) // e.g., bad request

				await expect(
					userService.updateCurrentUser(updatedData),
				).rejects.toThrow(axios.AxiosError)
				expect(mock.history.put.length).toBe(1)
				expect(consoleErrorSpy).toHaveBeenCalled()
			})
		})

		describe('getUserGroups', () => {
			it('should fetch user groups successfully', async () => {
				const userId = 1
				const mockGroups: Group[] = [
					{ id: 1, name: 'Admins' },
					{ id: 2, name: 'Editors' },
				]
				mock.onGet(`${API_USERS_URL}${userId}/groups/`).reply(200, mockGroups)

				const response = await userService.getUserGroups(userId)
				expect(response).toEqual(mockGroups)
				expect(mock.history.get.length).toBe(1)
				expect(mock.history.get[0].url).toBe(
					`${API_USERS_URL}${userId}/groups/`,
				)
			})

			it('should handle errors gracefully when fetching user groups', async () => {
				const userId = 1
				mock.onGet(`${API_USERS_URL}${userId}/groups/`).reply(500)
				await expect(userService.getUserGroups(userId)).rejects.toThrow()
				expect(mock.history.get.length).toBe(1)
				expect(consoleErrorSpy).toHaveBeenCalled()
			})
		})

		describe('updateUserGroups', () => {
			it('should update user groups successfully', async () => {
				const userId = 1
				const groupIdsToAssign = [1, 3]
				const mockUpdatedGroups: Group[] = [
					{ id: 1, name: 'Admins' },
					{ id: 3, name: 'Viewers' },
				]
				mock
					.onPut(`${API_USERS_URL}${userId}/groups/`)
					.reply(200, mockUpdatedGroups)

				const response = await userService.updateUserGroups(
					userId,
					groupIdsToAssign,
				)
				expect(response).toEqual(mockUpdatedGroups)
				expect(mock.history.put.length).toBe(1)
				expect(mock.history.put[0].url).toBe(
					`${API_USERS_URL}${userId}/groups/`,
				)
				expect(mock.history.put[0].data).toEqual(
					JSON.stringify(groupIdsToAssign),
				)
			})

			it('should handle errors gracefully when updating user groups', async () => {
				const userId = 1
				const groupIdsToAssign = [1, 3]
				mock.onPut(`${API_USERS_URL}${userId}/groups/`).reply(400)
				await expect(
					userService.updateUserGroups(userId, groupIdsToAssign),
				).rejects.toThrow()
				expect(mock.history.put.length).toBe(1)
				expect(consoleErrorSpy).toHaveBeenCalled()
			})
		})
	})
})

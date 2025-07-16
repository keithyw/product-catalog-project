import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import axiosClient from '@/lib/clients/axiosClient'
import { API_GROUPS_URL } from '@/lib/constants'
import groupService from '@/lib/services/group'
import { Group, GroupsResponse } from '@/types/group'

const mock = new MockAdapter(axiosClient)

describe('groupService', () => {
	let consoleErrorSpy: jest.SpyInstance

	beforeEach(() => {
		// Spy on console.error to suppress output during tests and check if it's called on error
		consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
	})

	afterEach(() => {
		// Reset mocks after each test to ensure test isolation
		mock.reset()
		// Restore original console.error implementation
		consoleErrorSpy.mockRestore()
	})

	describe('createGroup', () => {
		it('should create a group successfully', async () => {
			const mockGroup: Group = { id: 1, name: 'Admins' }
			mock.onPost(API_GROUPS_URL).reply(201, mockGroup)

			const response = await groupService.createGroup({ name: 'Admins' })

			expect(response).toEqual(mockGroup)
			expect(mock.history.post.length).toBe(1)
			expect(mock.history.post[0].url).toBe(API_GROUPS_URL)
			expect(mock.history.post[0].data).toEqual(
				JSON.stringify({ name: 'Admins' }),
			)
		})

		it('should handle errors when creating a group', async () => {
			mock.onPost(API_GROUPS_URL).reply(500)

			await expect(
				groupService.createGroup({ name: 'Admins' }),
			).rejects.toThrow(axios.AxiosError)
			expect(mock.history.post.length).toBe(1)
			expect(consoleErrorSpy).toHaveBeenCalled() // Ensure error was logged
		})
	})

	describe('deleteGroup', () => {
		it('should delete a group successfully', async () => {
			mock.onDelete(`${API_GROUPS_URL}1/`).reply(204) // 204 No Content for successful deletion

			await groupService.deleteGroup(1)

			expect(mock.history.delete.length).toBe(1)
			expect(mock.history.delete[0].url).toBe(`${API_GROUPS_URL}1/`)
		})

		it('should handle errors when deleting a group', async () => {
			mock.onDelete(`${API_GROUPS_URL}1/`).reply(404)

			await expect(groupService.deleteGroup(1)).rejects.toThrow(
				axios.AxiosError,
			)
			expect(mock.history.delete.length).toBe(1)
			expect(consoleErrorSpy).toHaveBeenCalled()
		})
	})

	describe('getGroup', () => {
		it('should fetch a single group successfully', async () => {
			const mockGroup: Group = { id: 1, name: 'Editors' }
			mock.onGet(`${API_GROUPS_URL}1/`).reply(200, mockGroup)

			const response = await groupService.getGroup(1)

			expect(response).toEqual(mockGroup)
			expect(mock.history.get.length).toBe(1)
			expect(mock.history.get[0].url).toBe(`${API_GROUPS_URL}1/`)
		})

		it('should handle errors when fetching a single group', async () => {
			mock.onGet(`${API_GROUPS_URL}1/`).reply(404)

			await expect(groupService.getGroup(1)).rejects.toThrow(axios.AxiosError)
			expect(mock.history.get.length).toBe(1)
			expect(consoleErrorSpy).toHaveBeenCalled()
		})
	})

	describe('getGroups', () => {
		it('should fetch a list of groups successfully', async () => {
			const mockResponse: GroupsResponse = {
				count: 2,
				next: null,
				previous: null,
				results: [
					{ id: 1, name: 'Admins' },
					{ id: 2, name: 'Users' },
				],
			}
			mock.onGet(API_GROUPS_URL).reply(200, mockResponse)

			const response = await groupService.getGroups()

			expect(response).toEqual(mockResponse)
			expect(mock.history.get.length).toBe(1)
			expect(mock.history.get[0].url).toBe(API_GROUPS_URL)
		})

		it('should handle errors when fetching groups', async () => {
			mock.onGet(API_GROUPS_URL).reply(500)

			await expect(groupService.getGroups()).rejects.toThrow(axios.AxiosError)
			expect(mock.history.get.length).toBe(1)
			expect(consoleErrorSpy).toHaveBeenCalled()
		})
	})

	describe('updateGroup', () => {
		it('should update a group successfully', async () => {
			const mockGroup: Group = { id: 1, name: 'Super Admins' }
			mock.onPut(`${API_GROUPS_URL}1/`).reply(200, mockGroup)

			const response = await groupService.updateGroup(1, {
				name: 'Super Admins',
			})

			expect(response).toEqual(mockGroup)
			expect(mock.history.put.length).toBe(1)
			expect(mock.history.put[0].url).toBe(`${API_GROUPS_URL}1/`)
			expect(mock.history.put[0].data).toEqual(
				JSON.stringify({ name: 'Super Admins' }),
			)
		})

		it('should handle errors when updating a group', async () => {
			mock.onPut(`${API_GROUPS_URL}1/`).reply(404)

			await expect(
				groupService.updateGroup(1, { name: 'Super Admins' }),
			).rejects.toThrow(axios.AxiosError)
			expect(mock.history.put.length).toBe(1)
			expect(consoleErrorSpy).toHaveBeenCalled()
		})
	})
})

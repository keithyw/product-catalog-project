import { renderHook, act, waitFor } from '@testing-library/react'
import { useEditItemController } from './useEditItemController'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { handleFormErrors } from '@/lib/utils/errorHandler'

// Mocks
jest.mock('next/navigation', () => ({
	useRouter: jest.fn(),
}))
jest.mock('react-hot-toast')
jest.mock('@/lib/utils/errorHandler')

describe('useEditItemController', () => {
	const mockRouter = { push: jest.fn() }
	const mockGetData = jest.fn()
	const mockUpdateData = jest.fn()
	const mockHandleFetchCallback = jest.fn()
	const mockTransformData = jest.fn()
	const schema = z.object({ name: z.string().min(1) })

	const defaultProps = {
		id: 1,
		getData: mockGetData,
		updateData: mockUpdateData,
		errorLoadingMessage: 'Error loading',
		redirectUrl: '/list',
		schema,
		handleFetchCallback: mockHandleFetchCallback,
		transformData: mockTransformData,
	}

	beforeEach(() => {
		;(useRouter as jest.Mock).mockReturnValue(mockRouter)
		jest.clearAllMocks()
	})

	it('should fetch data on mount', async () => {
		const mockData = { id: 1, name: 'Test' }
		mockGetData.mockResolvedValue(mockData)
		mockHandleFetchCallback.mockReturnValue({ name: 'Test' })

		const { result } = renderHook(() => useEditItemController(defaultProps))

		expect(result.current.isLoading).toBe(true)

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false)
		})

		expect(mockGetData).toHaveBeenCalledWith(1)
		expect(mockHandleFetchCallback).toHaveBeenCalledWith(mockData)
		expect(result.current.data).toEqual(mockData)
	})

	it('should handle fetch error', async () => {
		const error = new Error('Fetch failed')
		mockGetData.mockRejectedValue(error)

		const { result } = renderHook(() => useEditItemController(defaultProps))

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false)
		})

		expect(toast.error).toHaveBeenCalledWith('Error loading')
		expect(mockRouter.push).toHaveBeenCalledWith('/list')
	})

	it('should submit form successfully', async () => {
		const mockData = { id: 1, name: 'Test' }
		mockGetData.mockResolvedValue(mockData)
		mockHandleFetchCallback.mockReturnValue({ name: 'Test' })
		mockTransformData.mockResolvedValue({ name: 'Updated' })
		mockUpdateData.mockResolvedValue({ id: 1, name: 'Updated' })

		const { result } = renderHook(() => useEditItemController(defaultProps))

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false)
		})

		await act(async () => {
			await result.current.handleSubmit()
		})

		// Since we can't easily trigger form submission via hook return without inputs,
		// we might need to simulate it differently or trust that handleSubmit calls onSubmit.
		// However, react-hook-form's handleSubmit wraps our onSubmit.
		// If we call result.current.handleSubmit(), it expects an event or it validates and calls onSubmit.
		// Without inputs registered, it might validate default values.

		// Let's rely on the fact that we passed defaultValues via reset in fetchItem.

		expect(mockTransformData).toHaveBeenCalledWith({ name: 'Test' })
		expect(mockUpdateData).toHaveBeenCalledWith(1, { name: 'Updated' })
		expect(toast.success).toHaveBeenCalledWith('Item updated successfully!')
		expect(mockRouter.push).toHaveBeenCalledWith('/list')
	})

	it('should handle submit error', async () => {
		const mockData = { id: 1, name: 'Test' }
		mockGetData.mockResolvedValue(mockData)
		mockHandleFetchCallback.mockReturnValue({ name: 'Test' })
		mockTransformData.mockRejectedValue(new Error('Update failed'))

		const { result } = renderHook(() => useEditItemController(defaultProps))

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false)
		})

		await act(async () => {
			await result.current.handleSubmit()
		})

		expect(handleFormErrors).toHaveBeenCalled()
	})
})

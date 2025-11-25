import { renderHook } from '@testing-library/react'
import { usePermissions } from './usePermissions'
import useAuthStore from '@/stores/useAuthStore'

// Mock the store
jest.mock('@/stores/useAuthStore')

describe('usePermissions', () => {
	const mockUseAuthStore = useAuthStore as unknown as jest.Mock

	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should return false if not authenticated', () => {
		mockUseAuthStore.mockReturnValue({
			isAuthenticated: false,
			user: null,
			hasPermission: jest.fn().mockReturnValue(false),
			hasAnyPermission: jest.fn().mockReturnValue(false),
			isInGroup: jest.fn().mockReturnValue(false),
			isInAnyGroup: jest.fn().mockReturnValue(false),
		})

		const { result } = renderHook(() => usePermissions())

		expect(
			result.current.checkAccess({ requiredPermission: 'view_user' }),
		).toBe(false)
	})

	it('should check for required permission', () => {
		const hasPermission = jest.fn((perm) => perm === 'view_user')
		mockUseAuthStore.mockReturnValue({
			isAuthenticated: true,
			user: { is_staff: false, is_active: true },
			hasPermission,
			hasAnyPermission: jest.fn(),
			isInGroup: jest.fn(),
			isInAnyGroup: jest.fn(),
		})

		const { result } = renderHook(() => usePermissions())

		expect(
			result.current.checkAccess({ requiredPermission: 'view_user' }),
		).toBe(true)
		expect(
			result.current.checkAccess({ requiredPermission: 'delete_user' }),
		).toBe(false)
	})

	it('should check for required permissions (ALL)', () => {
		const hasPermission = jest.fn((perm) =>
			['view_user', 'edit_user'].includes(perm),
		)
		mockUseAuthStore.mockReturnValue({
			isAuthenticated: true,
			user: { is_staff: false, is_active: true },
			hasPermission,
			hasAnyPermission: jest.fn(),
			isInGroup: jest.fn(),
			isInAnyGroup: jest.fn(),
		})

		const { result } = renderHook(() => usePermissions())

		expect(
			result.current.checkAccess({
				requiredPermissions: ['view_user', 'edit_user'],
			}),
		).toBe(true)
		expect(
			result.current.checkAccess({
				requiredPermissions: ['view_user', 'delete_user'],
			}),
		).toBe(false)
	})

	it('should check for any permission (ANY)', () => {
		const hasAnyPermission = jest.fn((perms) => perms.includes('view_user'))
		mockUseAuthStore.mockReturnValue({
			isAuthenticated: true,
			user: { is_staff: false, is_active: true },
			hasPermission: jest.fn(),
			hasAnyPermission,
			isInGroup: jest.fn(),
			isInAnyGroup: jest.fn(),
		})

		const { result } = renderHook(() => usePermissions())

		expect(
			result.current.checkAccess({
				anyPermission: ['view_user', 'delete_user'],
			}),
		).toBe(true)
		expect(hasAnyPermission).toHaveBeenCalledWith(['view_user', 'delete_user'])
	})

	it('should check for staff status', () => {
		mockUseAuthStore.mockReturnValue({
			isAuthenticated: true,
			user: { is_staff: true, is_active: true },
			hasPermission: jest.fn(),
			hasAnyPermission: jest.fn(),
			isInGroup: jest.fn(),
			isInAnyGroup: jest.fn(),
		})

		const { result } = renderHook(() => usePermissions())

		expect(result.current.checkAccess({ requireStaff: true })).toBe(true)
	})

	it('should check for active status', () => {
		mockUseAuthStore.mockReturnValue({
			isAuthenticated: true,
			user: { is_staff: false, is_active: false },
			hasPermission: jest.fn(),
			hasAnyPermission: jest.fn(),
			isInGroup: jest.fn(),
			isInAnyGroup: jest.fn(),
		})

		const { result } = renderHook(() => usePermissions())

		expect(result.current.checkAccess({ requireActive: true })).toBe(false)
	})

	it('should check for required group', () => {
		const isInGroup = jest.fn((group) => group === 'Admins')
		mockUseAuthStore.mockReturnValue({
			isAuthenticated: true,
			user: { is_staff: false, is_active: true },
			hasPermission: jest.fn(),
			hasAnyPermission: jest.fn(),
			isInGroup,
			isInAnyGroup: jest.fn(),
		})

		const { result } = renderHook(() => usePermissions())

		expect(result.current.checkAccess({ requiredGroup: 'Admins' })).toBe(true)
		expect(result.current.checkAccess({ requiredGroup: 'Users' })).toBe(false)
	})

	it('should check for required groups (ALL)', () => {
		const isInGroup = jest.fn((group) => ['Admins', 'Editors'].includes(group))
		mockUseAuthStore.mockReturnValue({
			isAuthenticated: true,
			user: { is_staff: false, is_active: true },
			hasPermission: jest.fn(),
			hasAnyPermission: jest.fn(),
			isInGroup,
			isInAnyGroup: jest.fn(),
		})

		const { result } = renderHook(() => usePermissions())

		expect(
			result.current.checkAccess({ requiredGroups: ['Admins', 'Editors'] }),
		).toBe(true)
		expect(
			result.current.checkAccess({ requiredGroups: ['Admins', 'Users'] }),
		).toBe(false)
	})

	it('should check for any group (ANY)', () => {
		const isInAnyGroup = jest.fn((groups) => groups.includes('Admins'))
		mockUseAuthStore.mockReturnValue({
			isAuthenticated: true,
			user: { is_staff: false, is_active: true },
			hasPermission: jest.fn(),
			hasAnyPermission: jest.fn(),
			isInGroup: jest.fn(),
			isInAnyGroup,
		})

		const { result } = renderHook(() => usePermissions())

		expect(result.current.checkAccess({ anyGroup: ['Admins', 'Users'] })).toBe(
			true,
		)
		expect(isInAnyGroup).toHaveBeenCalledWith(['Admins', 'Users'])
	})
})

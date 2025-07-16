import { create } from 'zustand'
import { Permission } from '@/types/permission'

interface PermissionStore {
	permissions: Permission[]
	setPermissions: (permissions: Permission[]) => void
}

const usePermissionStore = create<PermissionStore>((set) => ({
	permissions: [],
	setPermissions: (permissions: Permission[]) => set({ permissions }),
}))

export default usePermissionStore

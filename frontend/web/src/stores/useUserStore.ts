import { create } from 'zustand'
import { User } from '@/types/user'

interface UserStore {
	users: User[]
	isLoading: boolean
	error: string | null
	setUsers: (users: User[]) => void
}

const useUserStore = create<UserStore>((set) => ({
	users: [],
	isLoading: false,
	error: null,
	setUsers: (users: User[]) => set({ users }),
}))

export default useUserStore

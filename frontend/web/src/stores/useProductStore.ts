import { create } from 'zustand'
import { Product } from '@/types/product'

interface ProductStore {
	products: Product[]
	isLoading: boolean
	error: string | null
	setProducts: (products: Product[]) => void
}

const useProductStore = create<ProductStore>((set) => ({
	products: [],
	isLoading: false,
	error: null,
	setProducts: (products: Product[]) => set({ products }),
}))

export default useProductStore

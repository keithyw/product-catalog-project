import { create } from 'zustand'
import { Product } from '@/types/product'

interface ProductStore {
	product: Partial<Product> | null
	products: Product[]
	currentStep: number
	isLoading: boolean
	error: string | null
	setProduct: (p: Partial<Product> | null) => void
	setProducts: (products: Product[]) => void
	setCurrentStep: (step: number) => void
	clearDraft: () => void
}

const useProductStore = create<ProductStore>((set) => ({
	product: null,
	products: [],
	currentStep: 1,
	isLoading: false,
	error: null,
	setProduct: (p) =>
		set((state) => ({ product: p ? { ...state.product, ...p } : null })),
	setProducts: (products: Product[]) => set({ products }),
	setCurrentStep: (step) => set({ currentStep: step }),
	clearDraft: () => set({ product: null, currentStep: 1 }),
}))

export default useProductStore

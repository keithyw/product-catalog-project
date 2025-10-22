import { create } from 'zustand'
import { z } from 'zod'
import { Asset, AssetAssociation } from '@/types/asset'
import { Product } from '@/types/product'

interface ProductStore {
	assets: Asset[]
	assetAssociations: AssetAssociation[]
	product: Product | null
	products: Product[]
	currentStep: number
	isCurrentStepValid: boolean
	isEditMode: boolean
	isSubmitting: boolean
	error: string | null
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	dynamicAttributeSchema: z.ZodObject<any> | null
	setAssets: (assets: Asset[]) => void
	setAssetAssociations: (assetAssociations: AssetAssociation[]) => void
	setProduct: (p: Product) => void
	setProducts: (products: Product[]) => void
	setCurrentStep: (step: number) => void
	setIsCurrentStepValid: (isValid: boolean) => void
	setIsEditMode: (isEditting: boolean) => void
	setIsSubmitting: (loading: boolean) => void
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	setDynamicAttributeSchema: (schema: z.ZodObject<any> | null) => void
	clearDraft: () => void
}

const useProductStore = create<ProductStore>((set) => ({
	assets: [],
	assetAssociations: [],
	product: null,
	products: [],
	currentStep: 1,
	isCurrentStepValid: false,
	isEditMode: false,
	isSubmitting: false,
	error: null,
	dynamicAttributeSchema: null,
	setAssets: (assets: Asset[]) => set({ assets }),
	setAssetAssociations: (assetAssociations: AssetAssociation[]) =>
		set({ assetAssociations }),
	setProduct: (p: Product) =>
		set((state) => ({ product: { ...state.product, ...p } })),
	setProducts: (products: Product[]) => set({ products }),
	setCurrentStep: (step: number) => set({ currentStep: step }),
	setIsCurrentStepValid: (isValid: boolean) =>
		set({ isCurrentStepValid: isValid }),
	setIsEditMode: (isEdit: boolean) => set({ isEditMode: isEdit }),
	setIsSubmitting: (submitting: boolean) => set({ isSubmitting: submitting }),
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	setDynamicAttributeSchema: (schema: z.ZodObject<any> | null) =>
		set({ dynamicAttributeSchema: schema }),
	clearDraft: () => set({ product: null, currentStep: 1 }),
}))

export default useProductStore

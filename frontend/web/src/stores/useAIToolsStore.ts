import { create } from 'zustand'
import {
	ENTITY_BRAND,
	ENTITY_CATEGORY,
	ENTITY_PRODUCT,
	ENTITY_PRODUCT_ATTRIBUTE,
} from '@/lib/constants'
import { SimpleCategory, SimpleProductAttribute } from '@/types/ai'
import { Brand } from '@/types/brand'
import { ProductAttributeSet, SimpleProduct } from '@/types/product'
import { WizardSlice, createWizardSlice } from './wizardStoreSlice'

interface AITools {
	prompt: string
	entityType: string
	brands: Brand[]
	categories: SimpleCategory[]
	productAttributes: SimpleProductAttribute[]
	productAttributeSet: ProductAttributeSet | null
	productAttributeSetName: string
	products: SimpleProduct[]
	image: File | null
	// currentStep: number
	hasPromptHint: boolean
	// isCurrentStepValid: boolean
	isPromptDisabled: boolean
	// isSubmitting: boolean
	// error: string
	setPrompt(prompt: string): void
	setEntityData: <T>(data: T[], entityType: string) => void
	setEntityType(type: string): void
	setBrands(brands: Brand[]): void
	setCategories(categories: SimpleCategory[]): void
	setProductAttributes(productAttributes: SimpleProductAttribute[]): void
	setProductAttributeSet(item: ProductAttributeSet): void
	setProductAttributeSetName(name: string): void
	setProducts(products: SimpleProduct[]): void
	setImage(image: File): void
	// setCurrentStep(step: number): void
	setHasPromptHint(hasHint: boolean): void
	// setIsCurrentStepValid(isValid: boolean): void
	setIsPromptDisabled(isDisabled: boolean): void
	// setIsSubmitting(submitting: boolean): void
	// setError(error: string): void
	clearDraft: () => void
}

type AIToolsStore = WizardSlice & AITools

const useAIToolsStore = create<AIToolsStore>()((set, get) => ({
	...createWizardSlice(set, () => ({}) as AIToolsStore, {
		setState: set,
		getState: () => ({}) as AIToolsStore,
		subscribe: () => () => {},
		getInitialState: () => ({}) as AIToolsStore,
	}),
	prompt: '',
	entityType: '',
	brands: [],
	categories: [],
	productAttributes: [],
	productAttributeSet: null,
	productAttributeSetName: '',
	products: [],
	image: null,
	// currentStep: 1,
	hasPromptHint: false,
	isCurrentStepValid: false,
	isPromptDisabled: false,
	// isSubmitting: false,
	// error: '',
	setPrompt: (prompt: string) => set({ prompt: prompt }),
	setEntityData: <T>(data: T[], entityType: string) => {
		switch (entityType) {
			case ENTITY_BRAND:
				set({ brands: data as Brand[] })
				break
			case ENTITY_CATEGORY:
				set({ categories: data as SimpleCategory[] })
				break
			case ENTITY_PRODUCT_ATTRIBUTE:
				set({ productAttributes: data as SimpleProductAttribute[] })
				break
			case ENTITY_PRODUCT:
				set({ products: data as SimpleProduct[] })
				break
		}
	},
	setEntityType: (type: string) => set({ entityType: type }),
	setBrands: (b: Omit<Brand, 'id'>[]) => set({ brands: b }),
	setCategories: (c: SimpleCategory[]) => set({ categories: c }),
	setProductAttributes: (p: Omit<SimpleProductAttribute, 'id'>[]) =>
		set({ productAttributes: p }),
	setProductAttributeSet: (item: ProductAttributeSet) =>
		set({ productAttributeSet: item }),
	setProductAttributeSetName: (name: string) =>
		set({ productAttributeSetName: name }),
	setProducts: (p: Omit<SimpleProduct, 'id'>[]) => set({ products: p }),
	setImage: (i: File) => set({ image: i }),
	// setCurrentStep: (step: number) => set({ currentStep: step }),
	setHasPromptHint: (hasHint: boolean) => set({ hasPromptHint: hasHint }),
	// setIsCurrentStepValid: (isValid: boolean) =>
	// set({ isCurrentStepValid: isValid }),
	setIsPromptDisabled: (isDisabled: boolean) =>
		set({ isPromptDisabled: isDisabled }),
	// setIsSubmitting: (submitting: boolean) => set({ isSubmitting: submitting }),
	// setError: (error: string) => set({ error: error }),
	clearDraft: () => {
		get().reset()
		set({
			// currentStep: 1,
			prompt: '',
			entityType: '',
			brands: [],
			categories: [],
			productAttributes: [],
			productAttributeSetName: '',
			// isCurrentStepValid: false,
			// isSubmitting: false,
			error: '',
		})
	},
}))

export default useAIToolsStore

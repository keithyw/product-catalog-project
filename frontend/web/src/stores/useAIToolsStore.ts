import { create } from 'zustand'
import { SimpleBrand, SimpleCategory, SimpleProductAttribute } from '@/types/ai'
import { ProductAttributeSet } from '@/types/product'

interface AIToolsStore {
	prompt: string
	entityType: string
	brands: SimpleBrand[]
	categories: SimpleCategory[]
	productAttributes: SimpleProductAttribute[]
	productAttributeSet: ProductAttributeSet | null
	productAttributeSetName: string
	currentStep: number
	hasPromptHint: boolean
	isCurrentStepValid: boolean
	isPromptDisabled: boolean
	isSubmitting: boolean
	error: string
	setPrompt(prompt: string): void
	setEntityData: <T>(data: T[], entityType: string) => void
	setEntityType(type: string): void
	setBrands(brands: SimpleBrand[]): void
	setCategories(categories: SimpleCategory[]): void
	setProductAttributes(productAttributes: SimpleProductAttribute[]): void
	setProductAttributeSet(item: ProductAttributeSet): void
	setProductAttributeSetName(name: string): void
	setCurrentStep(step: number): void
	setHasPromptHint(hasHint: boolean): void
	setIsCurrentStepValid(isValid: boolean): void
	setIsPromptDisabled(isDisabled: boolean): void
	setIsSubmitting(submitting: boolean): void
	setError(error: string): void
	clearDraft: () => void
}

const useAIToolsStore = create<AIToolsStore>((set) => ({
	prompt: '',
	entityType: '',
	brands: [],
	categories: [],
	productAttributes: [],
	productAttributeSet: null,
	productAttributeSetName: '',
	currentStep: 1,
	hasPromptHint: false,
	isCurrentStepValid: false,
	isPromptDisabled: false,
	isSubmitting: false,
	error: '',
	setPrompt: (prompt: string) => set({ prompt: prompt }),
	setEntityData: <T>(data: T[], entityType: string) => {
		switch (entityType) {
			case 'brands':
				set({ brands: data as SimpleBrand[] })
				break
			case 'categories':
				set({ categories: data as SimpleCategory[] })
				break
			case 'productAttributes':
				set({ productAttributes: data as SimpleProductAttribute[] })
				break
		}
	},
	setEntityType: (type: string) => set({ entityType: type }),
	setBrands: (b: Omit<SimpleBrand, 'id'>[]) => set({ brands: b }),
	setCategories: (c: SimpleCategory[]) => set({ categories: c }),
	setProductAttributes: (p: Omit<SimpleProductAttribute, 'id'>[]) =>
		set({ productAttributes: p }),
	setProductAttributeSet: (item: ProductAttributeSet) =>
		set({ productAttributeSet: item }),
	setProductAttributeSetName: (name: string) =>
		set({ productAttributeSetName: name }),
	setCurrentStep: (step: number) => set({ currentStep: step }),
	setHasPromptHint: (hasHint: boolean) => set({ hasPromptHint: hasHint }),
	setIsCurrentStepValid: (isValid: boolean) =>
		set({ isCurrentStepValid: isValid }),
	setIsPromptDisabled: (isDisabled: boolean) =>
		set({ isPromptDisabled: isDisabled }),
	setIsSubmitting: (submitting: boolean) => set({ isSubmitting: submitting }),
	setError: (error: string) => set({ error: error }),
	clearDraft: () =>
		set({
			currentStep: 1,
			prompt: '',
			entityType: '',
			brands: [],
			categories: [],
			productAttributes: [],
			productAttributeSetName: '',
			isCurrentStepValid: false,
			isSubmitting: false,
			error: '',
		}),
}))

export default useAIToolsStore

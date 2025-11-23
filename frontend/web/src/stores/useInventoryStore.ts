import { create } from 'zustand'
import { InventoryItem } from '@/types/inventory'
import { Product } from '@/types/product'

interface InventoryStore {
    inventoryItem: InventoryItem | null
    currentStep: number
    isCurrentStepValid: boolean
    isEditMode: boolean
    isSubmitting: boolean
    product: Product | null
    error: string | null
    setInventoryItem: (inventoryItem: InventoryItem | null) => void
    setIsCurrentStepValid: (isValid: boolean) => void
    setIsSubmitting: (submitting: boolean) => void
    setError: (error: string | null) => void
    setCurrentStep: (step: number) => void
    setIsEditMode: (isEditting: boolean) => void
    setProduct: (p: Product) => void
    reset: () => void
}

const useInventoryStore = create<InventoryStore>((set) => ({
    inventoryItem: null,
    currentStep: 1,
    isCurrentStepValid: false,
    isEditMode: false,
    isSubmitting: false,
    product: null,
    error: null,
    setInventoryItem: (inventoryItem: InventoryItem | null) => set({ inventoryItem }),
    setIsCurrentStepValid: (isValid: boolean) => set({ isCurrentStepValid: isValid }),
    setIsSubmitting: (submitting: boolean) => set({ isSubmitting: submitting }),
    setError: (error: string | null) => set({ error }),
    setCurrentStep: (step: number) => set({ currentStep: step }),
    setIsEditMode: (isEditting: boolean) => set({ isEditMode: isEditting }),
    setProduct: (p: Product) => set({ product: p }),
    reset: () => set({ inventoryItem: null, currentStep: 1, product: null }),
}))

export default useInventoryStore

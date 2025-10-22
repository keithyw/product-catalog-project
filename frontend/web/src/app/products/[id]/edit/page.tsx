'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useParams, useRouter } from 'next/navigation'
import PermissionGuard from '@/components/auth/PermissionGuard'
import WizardLayout from '@/components/layout/WizardLayout'
import SpinnerSection from '@/components/ui/SpinnerSection'
import { FAILED_LOADING_PRODUCT_ERROR, PRODUCTS_URL } from '@/lib/constants'
import { PRODUCT_PERMISSIONS } from '@/lib/constants/permissions'
import productService from '@/lib/services/product'
import useProductStore from '@/stores/useProductStore'
import { WizardStepType } from '@/types/wizard'
import AttributeSetStep from '@/app/products/create/steps/AttributeSetStep'
import ImageAssociationStep from '@/app/products/create/steps/ImageAssociationStep'
import ProductInfo from '@/app/products/create/steps/ProductInfoStep'

const wizardSteps: WizardStepType[] = [
	{ id: 'product', title: 'Product Info', component: ProductInfo },
	{ id: 'attribute_set', title: 'Attribute Set', component: AttributeSetStep },
	{
		id: 'image_association',
		title: 'Provide Images',
		component: ImageAssociationStep,
	},
]

export default function EditProductPage() {
	const router = useRouter()
	const params = useParams()
	const id = params.id
	const [isLoading, setIsLoading] = useState(false)
	const {
		currentStep,
		setCurrentStep,
		clearDraft,
		isCurrentStepValid,
		isSubmitting,
		setIsEditMode,
		setProduct,
	} = useProductStore()

	useEffect(() => {
		if (id) {
			setIsLoading(true)
			const fetchProduct = async () => {
				try {
					const res = await productService.get(parseInt(id as string))
					setProduct(res)
					setIsEditMode(true)
				} catch (e: unknown) {
					if (e instanceof Error) {
						console.error(e.message)
						toast.error(FAILED_LOADING_PRODUCT_ERROR)
						router.push(PRODUCTS_URL)
					}
				} finally {
					setIsLoading(false)
				}
			}
			fetchProduct()
			return () => {
				clearDraft()
			}
		}
	}, [id, router, setIsEditMode, setProduct, clearDraft])

	const currentStepHandler = useRef<(() => Promise<boolean>) | null>(null)

	const setStepHandler = (handler: (() => Promise<boolean>) | null) => {
		currentStepHandler.current = handler
	}

	const handleNext = async () => {
		if (currentStepHandler.current) {
			const success = await currentStepHandler.current()
			if (success) {
				const idx = wizardSteps.findIndex(
					(step) => step.id === wizardSteps[currentStep - 1].id,
				)
				const nextIdx = idx + 1
				if (nextIdx < wizardSteps.length) {
					setCurrentStep(nextIdx + 1)
				} else {
					toast.success('Product Updated')
					clearDraft()
					router.push(PRODUCTS_URL)
				}
			} else {
				toast.error('Please correct errors on form')
			}
		} else {
			toast.error('Current step has issues')
		}
	}

	const handlePrevious = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1)
		}
	}

	const handleCancel = () => {
		clearDraft()
		router.push(PRODUCTS_URL)
	}
	const steps = useMemo(() => {
		return wizardSteps.map((step, idx) => ({
			...step,
			isCompleted: idx < currentStep - 1,
		}))
	}, [currentStep])

	const CurrentStep = wizardSteps[currentStep - 1].component

	if (isLoading) {
		return <SpinnerSection spinnerMessage='Loading product...' />
	}

	return (
		<PermissionGuard requiredPermission={PRODUCT_PERMISSIONS.CHANGE}>
			<WizardLayout
				title='Edit Product'
				finalButtonText='Skip/Finish'
				steps={steps}
				currentStepId={wizardSteps[currentStep - 1].id}
				onNext={handleNext}
				onPrevious={handlePrevious}
				onCancel={handleCancel}
				isSubmitting={isSubmitting}
				canGoNext={isCurrentStepValid}
				canGoPrevious={currentStep > 1}
			>
				<CurrentStep setSubmitHandler={setStepHandler} />
			</WizardLayout>
		</PermissionGuard>
	)
}

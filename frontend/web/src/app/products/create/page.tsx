'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import PermissionGuard from '@/components/auth/PermissionGuard'
import WizardLayout from '@/components/layout/WizardLayout'
import { PRODUCTS_URL } from '@/lib/constants'
import { PERMISSION_PERMISSIONS } from '@/lib/constants/permissions'
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

export default function CreateProductPage() {
	const router = useRouter()
	const [isSubmitting] = useState(false)
	const { currentStep, setCurrentStep, clearDraft, isCurrentStepValid } =
		useProductStore()

	useEffect(() => {
		clearDraft()
	}, [clearDraft])

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
					toast.success('Product Created')
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

	const stepsForLayout = useMemo(() => {
		return wizardSteps.map((step, idx) => ({
			...step,
			isCompleted: idx < currentStep - 1,
		}))
	}, [currentStep])

	const CurrentStep = wizardSteps[currentStep - 1].component

	return (
		<PermissionGuard requiredPermission={PERMISSION_PERMISSIONS.ADD}>
			<WizardLayout
				title='Create New Product'
				finalButtonText='Skip/Finish'
				steps={stepsForLayout}
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

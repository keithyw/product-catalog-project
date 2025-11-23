'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import PermissionGuard from '@/components/auth/PermissionGuard'
import WizardLayout from '@/components/layout/WizardLayout'
import { PRODUCT_PERMISSIONS, INVENTORY_URL } from '@/lib/constants'
import useInventoryStore from '@/stores/useInventoryStore'
import { WizardStepType } from '@/types/wizard'
import ChooseProductStep from '@/app/inventory/create/steps/ChooseProductStep'
import ChooseProductAttributesStep from '@/app/inventory/create/steps/ChooseProductAttributesStep'
import InventoryItemDataStep from '@/app/inventory/create/steps/InventoryItemDataStep'

const wizardSteps: WizardStepType[] = [
	{
		id: 'choose-product',
		title: 'Choose Product',
		component: ChooseProductStep,
	},
	{
		id: 'choose-product-attributes',
		title: 'Choose Product Attributes',
		component: ChooseProductAttributesStep,
	},
	{
		id: 'inventory-item-data',
		title: 'Inventory Item Data',
		component: InventoryItemDataStep,
	},
]

const CreateInventoryPage = () => {
	const {
		currentStep,
		isCurrentStepValid,
		isSubmitting,
		reset,
		setCurrentStep,
	} = useInventoryStore()
	const router = useRouter()

	useEffect(() => {
		reset()
	}, [reset])

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
					toast.success('Inventory Item Created')
					reset()
					router.push(INVENTORY_URL)
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
		reset()
		router.push(INVENTORY_URL)
	}

	const stepsForLayout = useMemo(() => {
		return wizardSteps.map((step, idx) => ({
			...step,
			isCompleted: idx < currentStep - 1,
		}))
	}, [currentStep])

	const CurrentStep = wizardSteps[currentStep - 1].component

	return (
		<PermissionGuard requiredPermission={PRODUCT_PERMISSIONS.ADD}>
			<WizardLayout
				title='Create New Inventory Item'
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

export default CreateInventoryPage

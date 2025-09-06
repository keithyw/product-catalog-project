'use client'

import React, { useEffect } from 'react'
import PermissionGuard from '@/components/auth/PermissionGuard'
import AIGenerationLayout from '@/components/layout/AIGenerationLayout'
import {
	ENTITY_PRODUCT,
	PRODUCT_PERMISSIONS,
	PRODUCTS_URL,
} from '@/lib/constants'
import useAIToolsStore from '@/stores/useAIToolsStore'
import { WizardStepType } from '@/types/wizard'
import ImagePromptStep from '@/app/products/from-image/steps/ImagePromptStep'
import ProductReviewStep from '@/app/products/ai-tools/steps/ProductReviewStep'

const steps: WizardStepType[] = [
	{ id: 'prompt', title: 'Generate Prompt', component: ImagePromptStep },
	{ id: 'review', title: 'Review Product Info', component: ProductReviewStep },
]

const FromImagePage = () => {
	const { setEntityType } = useAIToolsStore()

	useEffect(() => {
		setEntityType(ENTITY_PRODUCT)
	}, [setEntityType])

	return (
		<PermissionGuard requiredPermission={PRODUCT_PERMISSIONS.ADD}>
			<AIGenerationLayout
				successUrl={PRODUCTS_URL}
				title='Generate Product with Image'
				wizardSteps={steps}
			/>
		</PermissionGuard>
	)
}

export default FromImagePage

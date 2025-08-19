'use client'

import React, { useEffect } from 'react'
import PermissionGuard from '@/components/auth/PermissionGuard'
import AIGenerationLayout from '@/components/layout/AIGenerationLayout'
import { ENTITY_PRODUCT, PRODUCTS_URL } from '@/lib/constants'
import { PRODUCT_PERMISSIONS } from '@/lib/constants/permissions'
import useAIToolsStore from '@/stores/useAIToolsStore'
import { WizardStepType } from '@/types/wizard'
import ProductPromptStep from '@/app/products/ai-tools/steps/ProductPromptStep'
import ProductReviewStep from '@/app/products/ai-tools/steps/ProductReviewStep'

const steps: WizardStepType[] = [
	{ id: 'prompt', title: 'Generate Prompt', component: ProductPromptStep },
	{ id: 'review', title: 'Review Data', component: ProductReviewStep },
]

const GeneratePage = () => {
	const { setEntityType } = useAIToolsStore()

	useEffect(() => {
		// no need to change this here
		setEntityType(ENTITY_PRODUCT)
	}, [setEntityType])

	return (
		<PermissionGuard requiredPermission={PRODUCT_PERMISSIONS.CHANGE}>
			<AIGenerationLayout
				successUrl={PRODUCTS_URL}
				title='Generate Products with AI'
				wizardSteps={steps}
			/>
		</PermissionGuard>
	)
}

export default GeneratePage

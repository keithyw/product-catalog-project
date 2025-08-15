'use client'

import React from 'react'
import PermissionGuard from '@/components/auth/PermissionGuard'
import AIGenerationLayout from '@/components/layout/AIGenerationLayout'
import {
	BRANDS_URL,
	CATEGORIES_URL,
	PRODUCT_ATTRIBUTES_URL,
	ENTITY_BRAND,
	ENTITY_CATEGORY,
	ENTITY_PRODUCT_ATTRIBUTE,
} from '@/lib/constants'
import { PRODUCT_PERMISSIONS } from '@/lib/constants/permissions'
import useAIToolsStore from '@/stores/useAIToolsStore'
import { WizardStepType } from '@/types/wizard'
import PromptStep from '@/app/ai-tools/steps/PromptStep'
import ReviewStep from '@/app/ai-tools/steps/ReviewStep'

const wizardSteps: WizardStepType[] = [
	{ id: 'prompt', title: 'Generate Prompt', component: PromptStep },
	{ id: 'review', title: 'Review Data', component: ReviewStep },
]

const GeneratePage: React.FC = () => {
	const entityType = useAIToolsStore((state) => state.entityType)
	let url = ''
	switch (entityType) {
		case ENTITY_BRAND:
			url = BRANDS_URL
			break
		case ENTITY_CATEGORY:
			url = CATEGORIES_URL
			break
		case ENTITY_PRODUCT_ATTRIBUTE:
			url = PRODUCT_ATTRIBUTES_URL
			break
		default:
			break
	}

	return (
		<PermissionGuard requiredPermission={PRODUCT_PERMISSIONS.CHANGE}>
			<AIGenerationLayout
				successUrl={url}
				title='Generate Data with AI'
				wizardSteps={wizardSteps}
			/>
		</PermissionGuard>
	)
}

export default GeneratePage

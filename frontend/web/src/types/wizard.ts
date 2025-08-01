import React from 'react'

export interface StepComponentProps {
	setSubmitHandler: (handler: (() => Promise<boolean>) | null) => void
}

export interface WizardStepType {
	id: string
	title: string
	component: React.ComponentType<StepComponentProps>
}

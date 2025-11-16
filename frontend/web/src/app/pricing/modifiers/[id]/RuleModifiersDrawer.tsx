import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import DualListSelector from '@/components/ui/DualListSelector'
import SlideOverDrawer from '@/components/ui/SlideOverDrawer'
import Button from '@/components/ui/form/Button'
import priceModifiersService from '@/lib/services/priceModifiers'
import {
	CreatePriceModifierRequest,
	PriceModifier,
	PriceRule,
} from '@/types/product'

interface RuleModifiersDrawerProps {
	modifier: PriceModifier
	priceRules: PriceRule[]
	removablePriceRules: PriceRule[]
	isOpen: boolean
	onClose: () => void
	onUpdate: (updatedModifier: PriceModifier) => void
}
const RuleModifiersDrawer = ({
	modifier,
	priceRules,
	removablePriceRules,
	isOpen,
	onClose,
	onUpdate,
}: RuleModifiersDrawerProps) => {
	const [isSaving, setIsSaving] = useState(false)
	const [localPriceRules, setLocalPriceRules] = useState<PriceRule[]>([])
	const [localRemovablePriceRules, setLocalRemovablePriceRules] = useState<
		PriceRule[]
	>([])

	useEffect(() => {
		const attachedRuleIds = new Set(removablePriceRules.map((r) => r.id))
		const trulyAvailableRules = priceRules.filter(
			(rule) => !attachedRuleIds.has(rule.id),
		)
		setLocalPriceRules(trulyAvailableRules)
		setLocalRemovablePriceRules(removablePriceRules)
	}, [priceRules, removablePriceRules])

	const ruleOptions = useMemo(() => {
		return localPriceRules.map((r) => ({
			value: r.id,
			label: r.name,
		}))
	}, [localPriceRules])

	const removeablePriceRuleOptions = useMemo(() => {
		return localRemovablePriceRules.map((r) => ({
			value: r.id,
			label: r.name,
		}))
	}, [localRemovablePriceRules])

	const handleAddRule = (ruleId: string | number) => {
		const addRule = localPriceRules.find((r) => r.id === ruleId)
		const updatedAddRules = localPriceRules.filter((r) => r.id !== ruleId)
		const removeRules = [...localRemovablePriceRules, addRule]
		setLocalPriceRules(updatedAddRules)
		setLocalRemovablePriceRules(removeRules as PriceRule[])
	}

	const handleRemoveRule = (ruleId: string | number) => {
		const removeRule = localRemovablePriceRules.find((r) => r.id === ruleId)
		const updatedRemoveRules = localRemovablePriceRules.filter(
			(r) => r.id !== ruleId,
		)
		const addRules = [...localPriceRules, removeRule]
		setLocalPriceRules(addRules as PriceRule[])
		setLocalRemovablePriceRules(updatedRemoveRules)
	}

	const handleSave = async () => {
		const request: CreatePriceModifierRequest = {
			...modifier,
			price_rules: localRemovablePriceRules.map((r) => r.id),
		}
		setIsSaving(true)
		try {
			const res = await priceModifiersService.patch(modifier.id, request)
			onUpdate(res)
			onClose()
			toast.success(`Rules for modifier ${modifier.name} updated successfully`)
		} catch (e: unknown) {
			console.error('Failed updating rules for modifier: ', e)
			toast.error(`Failed to update rules for modifier ${modifier.name}`)
		} finally {
			setIsSaving(false)
		}
	}

	const saveButton = (
		<Button
			actionType='submit'
			type='button'
			onClick={handleSave}
			className='ml-4'
			disabled={isSaving}
		>
			Save
		</Button>
	)
	return (
		<SlideOverDrawer
			title='Manage Price Rule Modifiers'
			isOpen={isOpen}
			onClose={onClose}
			additionalButtons={saveButton}
			panelWidthClass='max-w-2xl'
		>
			<DualListSelector
				addTitle='Available Rules'
				removeTitle='Included Rules'
				addItems={ruleOptions}
				removeItems={removeablePriceRuleOptions}
				onAdd={handleAddRule}
				onRemove={handleRemoveRule}
			/>
		</SlideOverDrawer>
	)
}

export default RuleModifiersDrawer

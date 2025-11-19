import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import DualListSelector from '@/components/ui/DualListSelector'
import SlideOverDrawer from '@/components/ui/SlideOverDrawer'
import Button from '@/components/ui/form/Button'
import priceService from '@/lib/services/price'
import { Product, PriceModifier } from '@/types/product'

interface PriceModifiersDrawerProps {
	product: Product
	modifiers: PriceModifier[]
	removableModifiers: PriceModifier[]
	isOpen: boolean
	onClose: () => void
	onUpdate: (updatedProduct: Product) => void
}

const PriceModifiersDrawer = ({
	product,
	modifiers,
	removableModifiers,
	isOpen,
	onClose,
	onUpdate,
}: PriceModifiersDrawerProps) => {
	const [isSaving, setIsSaving] = useState(false)
	const [localModifiers, setLocalModifiers] = useState<PriceModifier[]>([])
	const [localRemovableModifiers, setLocalRemovableModifiers] = useState<
		PriceModifier[]
	>([])

	useEffect(() => {
		const attachedModifierIds = new Set(removableModifiers.map((m) => m.id))
		const trulyAvailableModifiers = modifiers.filter(
			(modifier) => !attachedModifierIds.has(modifier.id),
		)
		setLocalModifiers(trulyAvailableModifiers)
		setLocalRemovableModifiers(removableModifiers)
	}, [modifiers, removableModifiers])

	const modifiersOptions = useMemo(() => {
		return localModifiers.map((m) => ({
			value: m.id,
			label: m.name,
		}))
	}, [localModifiers])

	const removableModifiersOptions = useMemo(() => {
		return localRemovableModifiers.map((m) => ({
			value: m.id,
			label: m.name,
		}))
	}, [localRemovableModifiers])

	const handleAddModifier = (modifierId: string | number) => {
		const addModifier = localModifiers.find((m) => m.id === modifierId)
		const updatedAddModifiers = localModifiers.filter(
			(m) => m.id !== modifierId,
		)
		const removeModifiers = [...localRemovableModifiers, addModifier]
		setLocalModifiers(updatedAddModifiers)
		setLocalRemovableModifiers(removeModifiers as PriceModifier[])
	}

	const handleRemoveModifier = (modifierId: string | number) => {
		const removeModifier = localRemovableModifiers.find(
			(m) => m.id === modifierId,
		)
		const updatedRemoveModifiers = localRemovableModifiers.filter(
			(m) => m.id !== modifierId,
		)
		const addModifiers = [...localModifiers, removeModifier]
		setLocalModifiers(addModifiers as PriceModifier[])
		setLocalRemovableModifiers(updatedRemoveModifiers)
	}

	const handleSave = async () => {
		const request = {
			...product?.price,
			price_modifiers: localRemovableModifiers.map((m) => m.id),
		}
		setIsSaving(true)
		try {
			const res = await priceService.patch(
				product?.price?.id as number,
				request,
			)
			onUpdate({ ...product, price: res } as Product)
			onClose()
			toast.success(
				`Modifiers for product ${product.name} updated successfully`,
			)
		} catch (e: unknown) {
			console.error('Failed updating modifiers for product: ', e)
			toast.error(`Failed to update modifiers for product ${product.name}`)
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
			title={`Manage Price Modifiers for ${product?.name}`}
			isOpen={isOpen}
			onClose={onClose}
			additionalButtons={saveButton}
			panelWidthClass='max-w-2xl'
		>
			<DualListSelector
				addTitle='Available Modifiers'
				removeTitle='Included Modifiers'
				addItems={modifiersOptions}
				removeItems={removableModifiersOptions}
				onAdd={handleAddModifier}
				onRemove={handleRemoveModifier}
			/>
		</SlideOverDrawer>
	)
}

export default PriceModifiersDrawer

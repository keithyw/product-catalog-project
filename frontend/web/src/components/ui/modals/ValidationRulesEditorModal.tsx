import React, { useEffect, useMemo, useState } from 'react'
import { DialogTitle } from '@headlessui/react'
import Button from '@/components/ui/form/Button'
import SelectDropdown from '@/components/ui/form/SelectDropdown'
import TextInput from '@/components/ui/form/TextInput'
import BaseModal from '@/components/ui/modals/BaseModal'
import { VALIDATION_RULES } from '@/lib/constants'
import { OptionType } from '@/types/form'

interface ValidationRulesEditorModalProps {
	isOpen: boolean
	attributeType: string
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	rules: Record<string, any>
	onClose: () => void
	onSave: (rules: string) => void
}

const ValidationRulesEditorModal: React.FC<ValidationRulesEditorModalProps> = ({
	isOpen,
	attributeType,
	rules,
	onClose,
	onSave,
}) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [localRules, setLocalRules] = useState<Record<string, any>>(rules || {})
	const [newRuleKey, setNewRuleKey] = useState<string>('')
	const [newRuleValue, setNewRuleValue] = useState<string>('')
	const [options, setOptions] = useState<OptionType[]>([])

	const availableRules = useMemo(() => {
		return (
			VALIDATION_RULES[attributeType as keyof typeof VALIDATION_RULES] || []
		)
	}, [attributeType])

	const handleAddRule = () => {
		if (newRuleKey && newRuleValue) {
			setLocalRules({ ...localRules, [newRuleKey]: newRuleValue })
			setNewRuleKey('')
			setNewRuleValue('')
		}
	}

	const handleRemoveRule = (key: string) => {
		const updatedRules = { ...localRules }
		delete updatedRules[key]
		setLocalRules(updatedRules)
	}

	const handleSave = () => {
		onSave(JSON.stringify(localRules))
		onClose()
	}

	useEffect(() => {
		setLocalRules(rules || {})
		setOptions(
			availableRules
				.filter((r) => !availableRules[r as keyof typeof availableRules])
				.map((r) => {
					return { value: r, label: r }
				}),
		)
	}, [availableRules, rules])

	return (
		<BaseModal isOpen={isOpen} onClose={onClose}>
			<div className='mt-4 space-y-4'>
				<DialogTitle
					as='h2'
					className='text-lg font-medium font-semibold text-gray-900 leading-6 capitalize'
				>
					Edit Validation Rules for {attributeType}
				</DialogTitle>
				<div className='mt-4 space-y-4 text-gray-600'>
					{Object.entries(localRules).map(([k, val]) => (
						<div key={k} className='flex items-center space-x-2'>
							<span className='font-bold w-1/3'>{k}:</span>
							<TextInput
								id='validationRuleValue'
								label='Update Rule Value'
								value={val}
								className='flex-1'
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
									setLocalRules({ ...localRules, [k]: e.target.value })
								}}
							/>
							<Button
								actionType='danger'
								className='mt-3'
								onClick={() => handleRemoveRule(k)}
							>
								Remove
							</Button>
						</div>
					))}
				</div>
				<div className='flex items-center space-x-2'>
					<SelectDropdown
						id='newRuleKey'
						label='Select Rule'
						options={options}
						selectedValue={newRuleKey}
						onSelect={(value) => setNewRuleKey(value as string)}
					/>
					<TextInput
						id='newRuleKey'
						label='Enter Rule Value'
						value={newRuleValue}
						onChange={(e) => setNewRuleValue(e.target.value)}
						type={newRuleKey === 'pattern' ? 'text' : 'number'}
						className='flex-1'
					/>
					<Button actionType='submit' className='mt-3' onClick={handleAddRule}>
						Add
					</Button>
				</div>
				<div className='mt-6 flex justify-end space-x-3'>
					<Button actionType='neutral' onClick={onClose}>
						Cancel
					</Button>
					<Button actionType='submit' onClick={handleSave}>
						Save
					</Button>
				</div>
			</div>
		</BaseModal>
	)
}

export default ValidationRulesEditorModal

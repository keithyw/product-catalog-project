import React, { useState } from 'react'
import DatePicker from 'react-datepicker'
import { DialogTitle } from '@headlessui/react'
import Button from '@/components/ui/form/Button'
import SelectDropdown from '@/components/ui/form/SelectDropdown'
import TextInput from '@/components/ui/form/TextInput'
import BaseModal from '@/components/ui/modals/BaseModal'
import ModalButtonActionSection from '@/components/ui/modals/ModalButtonActionSection'
import { COMPARISON_OPERATORS, RULE_TYPES } from '@/types/product'
import 'react-datepicker/dist/react-datepicker.css'

interface RulesConfigModalProps {
	initialRuleType: string
	isOpen: boolean
	onClose: () => void
	onUpdate: (type: string, config: string) => void
}

const RulesConfigModal = ({
	initialRuleType,
	isOpen,
	onClose,
	onUpdate,
}: RulesConfigModalProps) => {
	const [comparisonOperator, setComparisonOperator] = useState('')
	const [comparedValue, setComparedValue] = useState('')
	const [localRuleType, setLocalRuleType] = useState(initialRuleType)
	const [dateValue, setDateValue] = useState<Date | null>(new Date())
	const [timeValue, setTimeValue] = useState<Date | null>(new Date())

	const handleTypeChange = (newType: string) => {
		setLocalRuleType(newType)
	}

	const handleUpdate = () => {
		let ruleConfig = ''
		if (localRuleType === 'attribute_comparison') {
			ruleConfig = JSON.stringify({
				comparison_operator: comparisonOperator,
				compared_value: comparedValue,
			})
		} else if (localRuleType === 'date_comparison') {
			ruleConfig = JSON.stringify({
				comparison_operator: comparisonOperator,
				date_value: dateValue,
			})
		} else if (localRuleType === 'time_comparison') {
			ruleConfig = JSON.stringify({
				comparison_operator: comparisonOperator,
				time_value: timeValue,
			})
		} else {
			ruleConfig = ''
		}
		onUpdate(localRuleType, ruleConfig)
		onClose()
	}

	return (
		<BaseModal isOpen={isOpen} onClose={onClose}>
			<div className='mt-4 space-y-4'>
				<DialogTitle
					as='h2'
					className='text-lg font-medium font-semibold leading-6 text-gray-900'
				>
					Configure Rule Parameters
				</DialogTitle>
				<div className='space-y-2 border-b pb-4'>
					<SelectDropdown
						id='rule_type'
						name='rule_type'
						label='Rule Type'
						selectedValue={localRuleType}
						options={RULE_TYPES}
						placeholder='Select a rule type'
						onSelect={(v) => handleTypeChange(v as string)}
					/>
				</div>
				<div className='p-4 border rounded-md bg-gray-50 min-h-[150px]'>
					{!localRuleType && (
						<p className='text-gray-600 pt-8 text-center'>
							Select a Rule Type above to configure parameters.
						</p>
					)}
					{localRuleType === 'always_true' && (
						<p className='text-gray-600 pt-8 text-center'>
							This rule requires no additional configuration.
						</p>
					)}
					{localRuleType === 'attribute_comparison' && (
						<div className='space-y-3'>
							<h3 className='font-semibold text-gray-900 mb-4'>
								Attribute Comparison
							</h3>
							<p className='text-sm text-gray-700'>
								Apply this rule if the **Attribute** (to be specified later) is
								evaluated against the following condition:
							</p>
							<div className='flex space-x-4 items-start'>
								<div className='w-1/4 min-w-[150px]'>
									<SelectDropdown
										id='comparison_operator'
										name='comparison_operator'
										label='Comparison Operator'
										selectedValue={comparisonOperator}
										options={COMPARISON_OPERATORS}
										placeholder='Select a comparison operator'
										onSelect={(v) => setComparisonOperator(v as string)}
									/>
								</div>
								<div className='flex-1'>
									<TextInput
										id='compared_value'
										name='compared_value'
										label='Comparison Value'
										value={comparedValue}
										onChange={(e) => setComparedValue(e.target.value as string)}
									/>
								</div>
							</div>
						</div>
					)}
					{['date_comparison', 'time_comparison'].includes(localRuleType) && (
						<div className='space-y-3'>
							<h3 className='font-semibold text-gray-900 mb-4'>
								{localRuleType === 'date_comparison' ? 'Date' : 'Time'}{' '}
								Comparison
							</h3>
							<p className='text-sm text-gray-700'>
								Apply this rule if the **Attribute** (to be specified later) is
								evaluated against the following condition:
							</p>
							<div className='flex space-x-4 items-start'>
								<div className='w-1/4 min-w-[150px]'>
									<SelectDropdown
										id='comparison_operator'
										name='comparison_operator'
										label='Comparison Operator'
										selectedValue={comparisonOperator}
										options={COMPARISON_OPERATORS}
										placeholder='Select a comparison operator'
										onSelect={(v) => setComparisonOperator(v as string)}
									/>
								</div>
								<div className='flex-1 text-gray-700'>
									<label
										htmlFor='date_value'
										className='block text-gray-700 text-sm font-bold mb-2'
									>
										Choose a{' '}
										{localRuleType === 'date_comparison' ? 'Date' : 'Time'}
									</label>
									{localRuleType === 'date_comparison' ? (
										<DatePicker
											selected={dateValue}
											onChange={(d) => setDateValue(d)}
										/>
									) : (
										<DatePicker
											selected={timeValue}
											onChange={(d) => setTimeValue(d)}
											showTimeSelect
											showTimeSelectOnly
											timeCaption='Time'
											dateFormat='h:mm aa'
											timeIntervals={15}
											className='block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
											wrapperClassName='w-full'
										/>
									)}
								</div>
							</div>
						</div>
					)}
				</div>
				<ModalButtonActionSection>
					<Button actionType='submit' onClick={handleUpdate}>
						Update Rules
					</Button>
					<Button actionType='neutral' onClick={onClose}>
						Cancel
					</Button>
				</ModalButtonActionSection>
			</div>
		</BaseModal>
	)
}

export default RulesConfigModal

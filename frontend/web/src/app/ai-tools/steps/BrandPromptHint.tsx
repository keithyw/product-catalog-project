import React, { useState } from 'react'
import { DialogTitle } from '@headlessui/react'
import Button from '@/components/ui/form/Button'
import TextInput from '@/components/ui/form/TextInput'
import useAIToolsStore from '@/stores/useAIToolsStore'

interface BrandPromptHintProps {
	onHandleSubmit: () => void
}

const BrandPromptHint: React.FC<BrandPromptHintProps> = ({
	onHandleSubmit,
}) => {
	const [localPrompt, setLocalPrompt] = useState('')
	const [example, setExample] = useState('')
	const { prompt, setPrompt } = useAIToolsStore()

	const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setLocalPrompt(e.target.value)
		let exampleText = ''
		if (example) {
			exampleText = `such as ${example}`
		}
		setPrompt(
			`Generate a list of 10 ${e.target.value} brands ${exampleText} with a name and description.`,
		)
	}

	const handleExampleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setExample(e.target.value)
		let exampleText = ''
		if (e.target.value) {
			exampleText = `such as ${e.target.value}`
		}
		setPrompt(
			`Generate a list of 10 ${localPrompt} brands ${exampleText} with a name and description.`,
		)
	}

	const handleSubmit = () => {
		setLocalPrompt('')
		onHandleSubmit()
	}

	return (
		<div>
			<DialogTitle
				as='h3'
				className='text-lg font-medium leading-6 text-gray-900'
			>
				Hint: Try using specific brand types in your prompt.
			</DialogTitle>
			<div className='mt-2'>
				<TextInput
					id='brandPrompt'
					label='Brand Prompt'
					placeholder='Brand types like "toy", "electronics", etc.'
					value={localPrompt}
					onChange={handlePromptChange}
				/>
			</div>
			<div className='mt-2'>
				<TextInput
					id='brandExample'
					label='Brand Example'
					placeholder='e.g., "LEGO", "Apple", etc.'
					value={example}
					onChange={handleExampleChange}
				/>
			</div>
			<div className='mt-2'>
				<p className='mb-2 py-4'>
					<span className='font-bold text-gray-900 mr-2'>
						Formatted Prompt:
					</span>
					<span className='text-gray-900 italic'>{prompt}</span>
				</p>
				<Button actionType='submit' onClick={handleSubmit}>
					Update Prompt
				</Button>
			</div>
		</div>
	)
}

export default BrandPromptHint

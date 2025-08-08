import React, { useState } from 'react'
import { DialogTitle } from '@headlessui/react'
import Button from '@/components/ui/form/Button'
import TextInput from '@/components/ui/form/TextInput'
import useAIToolsStore from '@/stores/useAIToolsStore'

interface CategoryPromptHintProps {
	onHandleSubmit: () => void
}

const CategoryPromptHint: React.FC<CategoryPromptHintProps> = ({
	onHandleSubmit,
}) => {
	const [localPrompt, setLocalPrompt] = useState('')
	const [subcategories, setSubcategories] = useState('')
	const [example, setExample] = useState('')
	const { prompt, setPrompt } = useAIToolsStore()

	const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setLocalPrompt(e.target.value)
		setPrompt(
			`Generate a hierarchical category list for ${localPrompt}. 
             Include subcategories like ${subcategories}. Also, include as many
             subgenres if they exist for each subcategory. Examples would be ${example}.
             Do at least 10 categories and subcategories/subgenres`,
		)
	}

	const handleSubcategoriesChange = (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		setSubcategories(e.target.value)
		setPrompt(
			`Generate a hierarchical category list for ${localPrompt}. 
             Include subcategories like ${subcategories}. Also, include as many
             subgenres if they exist for each subcategory. Examples would be ${example}.
             Do at least 10 categories and subcategories/subgenres`,
		)
	}

	const handleExampleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setExample(e.target.value)
		setPrompt(
			`Generate a hierarchical category list for ${localPrompt}. 
             Include subcategories like ${subcategories}. Also, include as many
             subgenres if they exist for each subcategory. Examples would be ${example}.
             Do at least 10 categories and subcategories/subgenres`,
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
				Provide hints for category prompt.
			</DialogTitle>
			<div className='mt-2'>
				<TextInput
					id='categoryPrompt'
					label='Category Prompt'
					placeholder='Category types like "toy", "electronics", etc.'
					value={localPrompt}
					onChange={handlePromptChange}
				/>
			</div>
			<div className='mt-2'>
				<TextInput
					id='subcategories'
					label='Subcategories'
					placeholder='e.g., "Building Sets", "Smartphones", etc.'
					value={subcategories}
					onChange={handleSubcategoriesChange}
				/>
			</div>
			<div className='mt-2'>
				<TextInput
					id='categoryExample'
					label='Category Example'
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

export default CategoryPromptHint

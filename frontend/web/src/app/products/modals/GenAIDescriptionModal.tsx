import React, { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { DialogTitle } from '@headlessui/react'
import {
	DocumentTextIcon,
	SparklesIcon,
	XMarkIcon,
} from '@heroicons/react/24/outline'
import Button from '@/components/ui/form/Button'
import TextareaInput from '@/components/ui/form/TextareaInput'
import BaseModal from '@/components/ui/modals/BaseModal'
import productService from '@/lib/services/product'
import useProductStore from '@/stores/useProductStore'

interface GenAIDescriptionModalProps {
	isOpen: boolean
	onClose: () => void
}

const GenAIDescriptionModal = ({
	isOpen,
	onClose,
}: GenAIDescriptionModalProps) => {
	const [isLoading, setIsLoading] = useState(false)
	const [prompt, setPrompt] = useState('')
	const [description, setDescription] = useState('')
	const { product, setProduct } = useProductStore()

	const handleGenerate = useCallback(async () => {
		if (product) {
			setIsLoading(true)
			try {
				const res = await productService.generateDescription(
					parseInt(product?.id),
					prompt,
				)
				setDescription(res.detail.description)
			} catch (e: unknown) {
				console.error(e)
				toast.error(`Failed generating a product description: ${e}`)
			} finally {
				setIsLoading(false)
			}
		}
	}, [product, prompt])

	const handleSubmit = useCallback(async () => {
		if (product) {
			setIsLoading(true)
			const payload = {
				description: description,
			}
			try {
				const updatedProduct = await productService.patch(
					parseInt(product.id),
					payload,
				)
				setProduct(updatedProduct)
				setPrompt('')
				setDescription('')
				toast.success(`Updated product description for ${product.name}`)
				onClose()
			} catch (e: unknown) {
				console.error(e)
				toast.error(`Failed updating product description: ${e}`)
			} finally {
				setIsLoading(false)
			}
		}
	}, [description, onClose, product, setProduct])

	return (
		<BaseModal isOpen={isOpen} onClose={onClose}>
			<div className='mt-4 space-y-4'>
				<DialogTitle
					as='h2'
					className='text-lg font-medium font-semibold leading-6 text-gray-900'
				>
					Generate Description with AI
				</DialogTitle>
				<div className='text-sm text-gray-500'>
					Use the text field below to provide instructions to the AI to either
					create, enhance or attempt to find the official product description
					for{' '}
					<span className='font-semibold'>
						{product?.name || 'Product Not Set'}
					</span>
					.
				</div>
				<div className='text-gray-700'>
					<div className='p-2'>
						Current Description: {product?.description || 'No description'}
					</div>
				</div>
				<div>
					<TextareaInput
						id='prompt'
						label='Prompt'
						rows={6}
						value={prompt}
						onChange={(e) => setPrompt(e.target.value)}
					/>
				</div>
				<div className='flex justify-between items-center pt-2 border-t border-gray-100'>
					<Button
						actionType='submit'
						disabled={!prompt.trim()}
						icon={<SparklesIcon className='w-5 h-5 mr-1' />}
						isLoading={isLoading}
						className='flex items-center'
						onClick={handleGenerate}
					>
						{isLoading ? 'Generating…' : 'Generate'}
					</Button>
					<Button
						actionType='neutral'
						disabled={isLoading}
						className='flex items-center'
						icon={<XMarkIcon className='w-5 h-5 mr-1' />}
						onClick={onClose}
					>
						Cancel
					</Button>
				</div>
				{description && (
					<div className='mt-4 p-4 border border-green-200 bg-green-50 rounded-lg space-y-3'>
						<h3 className='text-sm font-semibold text-green-700 flex items-center'>
							<DocumentTextIcon className='w-5 h-5 mr-1' />
							Generated Description
						</h3>
						<div className='text-sm text-gray-800 whitespace-pre-wrap p-2 max-h-60 bg-white rounded-md border border-green-100 overflow-y-auto'>
							{description}
						</div>
						<Button
							actionType='submit'
							className='w-full'
							onClick={handleSubmit}
						>
							Update Description
						</Button>
					</div>
				)}
			</div>
		</BaseModal>
	)
}

export default GenAIDescriptionModal

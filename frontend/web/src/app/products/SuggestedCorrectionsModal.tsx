import React from 'react'
import { DialogTitle } from '@headlessui/react'
import Button from '@/components/ui/form/Button'
import BaseModal from '@/components/ui/modals/BaseModal'
import { Product } from '@/types/product'

interface SuggestedCorrectionsModalProps {
	product: Product
	isOpen: boolean
	isUpdating: boolean
	onClose: () => void
	onAccept: () => void
	onReject: () => void
}

const SuggestedCorrectionsModal = ({
	product,
	isOpen,
	isUpdating,
	onClose,
	onAccept,
	onReject,
}: SuggestedCorrectionsModalProps) => {
	return (
		<BaseModal isOpen={isOpen} onClose={onClose}>
			{product ? (
				<div>
					<DialogTitle
						as='h2'
						className='text-lg font-medium font-semibold text-gray-900 leading-6'
					>
						Suggested Corrections for {product.name} ID: {product.id}
					</DialogTitle>
					<p className='text-sm text-gray-500 mt-4'>
						Review the AI-generated suggestions to accept or reject corrections.
					</p>
					<div className='mt-4 space-y-4 max-h-96 overflow-y-auto pr-2'>
						{product.suggested_corrections.map((c) => (
							<div
								key={c.field}
								className='p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50/70'
							>
								<h3 className='text-md font-semibold text-gray-800 mb-2'>
									{c.field}
								</h3>
								<div className='mb-2 p-2 bg-red-50 border-l-4 border-red-400 rounded'>
									<p className='text-xs font-medium text-green-700'>
										Original Value
									</p>
									<p className='text-sm text-gray-800 whitespace-pre-wrap'>
										{c.original_value || 'N/A'}
									</p>
								</div>
								<div className='p-2 bg-green-50 border-l-4 border-green-400 rounded'>
									<p className='text-xs font-medium text-green-700'>
										Corrected Value
									</p>
									<p className='text-sm text-gray-800 whitespace-pre-wrap'>
										{c.corrected_value || 'N/A'}
									</p>
								</div>
							</div>
						))}
					</div>
					<div className='mt-6 flex justify-end space-x-3'>
						<Button
							actionType='neutral'
							onClick={onClose}
							disabled={isUpdating}
						>
							Cancel
						</Button>
						<Button
							actionType='submit'
							onClick={onAccept}
							disabled={isUpdating}
						>
							Accept
						</Button>
						<Button
							actionType='danger'
							onClick={onReject}
							disabled={isUpdating}
						>
							Reject
						</Button>
					</div>
				</div>
			) : (
				<div>No Product</div>
			)}
		</BaseModal>
	)
}

export default SuggestedCorrectionsModal

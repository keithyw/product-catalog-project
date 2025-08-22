import React from 'react'
import Chip from '@/components/ui/Chip'
import CollapsibleCard from '@/components/ui/CollapsibleCard'
import Button from '@/components/ui/form/Button'
import { SimpleProduct } from '@/types/product'

interface ProductReviewCardProps {
	product: SimpleProduct
	onEdit: (product: SimpleProduct) => void
	onRemove: (product: SimpleProduct) => void
}

const ProductReviewCard = ({
	product,
	onEdit,
	onRemove,
}: ProductReviewCardProps) => {
	const hasAttributes = Object.keys(product.attributes).length > 0
	const attributes = Object.keys(product.attributes)

	const cardTitle = (
		<div className='flex-1 min-w-0 pr-4'>
			<h3 className='text-xl font-semibold text-gray-900 truncate'>
				{product.name}
			</h3>
			{product.brand && (
				<Chip chipType='secondary' className='mt-4'>
					Brand: {product.brand}
				</Chip>
			)}
		</div>
	)

	return (
		<CollapsibleCard title={cardTitle}>
			<div className='text-sm text-gray-600 space-y-2 my-4'>
				{hasAttributes ? (
					<div className='mb-4'>
						<h4 className='font-semibold text-gray-800'>Top Attributes:</h4>
						{attributes.map((a) => (
							<div
								key={a}
								className='flex justify-between items-center py-1 border-b bordery-gray-100 last:border-b-0'
							>
								<span className='font-medium text-gray-700'>{a}</span>
								<span className='text-gray-500 truncate ml-2'>
									{JSON.stringify(product.attributes[a])}
								</span>
							</div>
						))}
					</div>
				) : (
					<p className='text-sm italicc text-gray-500'>
						No attributes to display.
					</p>
				)}
			</div>
			<div className='flex justify-end space-x-2'>
				<Button actionType='neutral' onClick={() => onEdit(product)}>
					Edit
				</Button>
				<Button actionType='danger' onClick={() => onRemove(product)}>
					Remove
				</Button>
			</div>
		</CollapsibleCard>
	)
}

export default ProductReviewCard

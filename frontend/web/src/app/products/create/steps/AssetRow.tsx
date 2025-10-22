import React from 'react'
import { TrashIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import Button from '@/components/ui/form/Button'
import { Asset } from '@/types/asset'

interface AssetSectionProps {
	asset: Asset
	isSubmitting: boolean
	onRemove: (asset: Asset) => void
}

const AssetRow = ({ asset, isSubmitting, onRemove }: AssetSectionProps) => {
	return (
		<div className='flex items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm'>
			<div className='w-20 h-20 flex-shrink-0 mr-4 overflow-hidden rounded-md'>
				<Image
					src={asset.url}
					width={80}
					height={80}
					alt={asset.description || asset.name || 'Preview'}
					style={{ objectFit: 'contain' }}
					loading='lazy'
					className='w-full h-full'
					onError={(e) => {
						e.currentTarget.style.display = 'none'
						e.currentTarget.parentElement!.innerHTML =
							'<span class="text-xs text-gray-500 text-center p-2">Failed to Load</span>'
					}}
				/>
			</div>
			<div className='flex-1 min-w-0'>
				<p className='text-sm font-medium text-gray-800'>
					{asset.name || 'Untitled Image'}
				</p>
				<p className='text-xs text-gray-500'>
					{asset.description || 'No Description'}
				</p>
			</div>
			<div className='ml-4 flex-shrink-0'>
				<Button
					actionType='delete'
					disabled={isSubmitting}
					icon={<TrashIcon className='w-5 h-5' />}
					className='!p-1.5'
					onClick={() => {
						onRemove(asset)
					}}
				>
					Remove
				</Button>
			</div>
		</div>
	)
}

export default AssetRow

'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { File, FileText, ImageIcon, Music, Video } from 'lucide-react'

interface AssetPreviewProps {
	url: string | null | undefined
	alt?: string | null | undefined
	type: string | null | undefined
	className?: string
}

const AssetPreview: React.FC<AssetPreviewProps> = ({
	url,
	alt,
	type,
	className,
}) => {
	const [hasError, setHasError] = useState(false)

	const commonContainerClasses = `flex h-12 w-12 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 ${
		className || ''
	}`
	const commonIconClasses = 'h-6 w-6 text-gray-500'

	const getIconForType = (assetType: string) => {
		switch (assetType.toLowerCase()) {
			case 'video':
				return <Video className={commonIconClasses} />
			case 'audio':
				return <Music className={commonIconClasses} />
			case 'pdf':
				return <FileText className={commonIconClasses} />
			case 'document':
				return <File className={commonIconClasses} />
			default:
				return <ImageIcon className={commonIconClasses} />
		}
	}

	if (type?.toLowerCase() !== 'image' || !url || hasError) {
		return (
			<div className={commonContainerClasses}>
				{getIconForType(type || 'unknown')}
			</div>
		)
	}

	return (
		<a href={url} target='_blank' rel='noopener noreferrer'>
			<Image
				src={url}
				alt={alt || 'Asset preview'}
				width={48}
				height={48}
				className={`h-12 w-12 rounded-md object-cover transition-transform duration-200 ease-in-out hover:scale-150 ${
					className || ''
				}`}
				onError={() => setHasError(true)}
				loading='lazy'
			/>
		</a>
	)
}

export default AssetPreview

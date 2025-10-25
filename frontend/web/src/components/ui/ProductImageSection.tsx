import React, { useState } from 'react'
import Image from 'next/image'
import { Asset } from '@/types/asset'

interface ProductImageSectionProps {
	assets: Asset[]
}

const ProductImageSection = ({ assets }: ProductImageSectionProps) => {
	const images = assets.filter((a) => a.type === 'image')
	const [heroImage, setHeroImage] = useState<Asset | null>(
		images.length > 0 ? images[0] : null,
	)
	console.log('image')
	console.log(heroImage)

	const NoImagePlaceholder = () => (
		<div className='flex items-center justify-center h-full w-full bg-gray-100 text-gray-400 rounded-lg border-2 border-dashed-border-gray-300'>
			<span className='w-12 h-12 mr-2'>No Image</span>
		</div>
	)

	return (
		<div className='space-y-4 lg:max-w-[466px]'>
			<div
				className='
                    bg-white
                    rounded-xl
                    shadow-lg
                    p-4
                    aspect-square
                    overflow-hidden
                    mx-auto
                    max-w-full
                    lg:max-w-[466px]'
			>
				{heroImage ? (
					<div className='relative w-full h-full'>
						<Image
							src={heroImage.url}
							alt={heroImage.name || 'Hero Image'}
							fill
							priority
							sizes='(max-width: 768px) 100vw, 466px'
							className='object-contain'
						/>
					</div>
				) : (
					<NoImagePlaceholder />
				)}
			</div>
			{images.length > 1 && (
				<div className='bg-white rounded-xl shadow-lg p-3'>
					<div className='flex flex-wrap gap-3 overflow-x-auto'>
						{images.map((img) => (
							<div
								key={img.id}
								className={`
                                    relative w-20 h-20 sm:w-24 sm:h-24
                                    rounded-lg overflow-hidden
                                    cursor-pointer
                                    transition-all duration-200
                                    ${heroImage?.id === img.id ? 'ring-4 ring-purple-500 shadow-md' : 'ring-1 ring-gray-300 hover:ring-2 hover:ring-purple-400'}
                                `}
								onClick={() => setHeroImage(img)}
							>
								<Image
									src={img.url}
									alt={img.name || 'Thumbnail'}
									fill
									sizes='96px'
									className='object-cover'
								/>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	)
}

export default ProductImageSection

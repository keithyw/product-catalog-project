import React from 'react'
import { Squares2X2Icon } from '@heroicons/react/24/outline'

interface ProductAttributesSectionProps {
	attributes: Record<string, string>[]
}

const ProductAttributesSection = ({
	attributes,
}: ProductAttributesSectionProps) => {
	if (attributes.length === 0) {
		return (
			<div className='p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center text-gray-500'>
				<Squares2X2Icon className='w-5 h-5 mr-2' />
				<p>No attributes for this product.</p>
			</div>
		)
	}
	return (
		<div className='space-y-12 mt-8'>
			<h2 className='text-xl fold-bold text-gray-800 flex items-center border-b pb-2'>
				<Squares2X2Icon className='w-5 h-5 mr-2 text-purple-600' />
				Attributes
			</h2>
			<dl className='grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3'>
				{attributes.map((attr, idx) => (
					<div
						key={idx}
						className='flex flex-col p-3 border border-gray-100 rounded-lg bg-white shadow-sm hover:shadow-md transition duration-150'
					>
						<dt className='text-xs font-semibold tracking-wide text-gray-500 truncate'>
							{attr.label}
						</dt>
						<dd className='mt-1 text-base font-medium text-gray-900 whitespace-normal break-words'>
							{attr.value}
						</dd>
					</div>
				))}
			</dl>
		</div>
	)
}

export default ProductAttributesSection

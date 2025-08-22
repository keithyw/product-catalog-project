import React from 'react'
import {
	Disclosure,
	DisclosureButton,
	DisclosurePanel,
} from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

interface CollapsibleCardProps {
	title: string | React.ReactNode
	children: React.ReactNode
}

const CollapsibleCard = ({ title, children }: CollapsibleCardProps) => {
	return (
		<div className='w-full bg-white rounded-xl shadow-md p-6 mb-4'>
			<Disclosure>
				<DisclosureButton>
					<span className='flex-1 truncate'>{title}</span>
					<ChevronDownIcon className='h-6 w-6 my-4 text-blue-500 transition-transform duration-200 group-data-open:rotate-180' />
				</DisclosureButton>
				<DisclosurePanel className='mt-4 text-sm text-gray-600'>
					{children}
				</DisclosurePanel>
			</Disclosure>
		</div>
	)
}

export default CollapsibleCard

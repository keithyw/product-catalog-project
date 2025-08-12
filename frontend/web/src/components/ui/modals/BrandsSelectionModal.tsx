import React, { useState } from 'react'
import { DialogTitle } from '@headlessui/react'
import { PlusIcon } from '@heroicons/react/24/outline'
import Button from '@/components/ui/form/Button'
import SearchInput from '@/components/ui/form/SearchInput'
import BaseModal from '@/components/ui/modals/BaseModal'
import { Brand } from '@/types/brand'

interface BrandsSelectionModalProps {
	isOpen: boolean
	onClose: () => void
	allBrands: Brand[]
	selectedBrands: Brand[]
	onSelectBrand: (brand: Brand) => void
}

const BrandsSelectionModal: React.FC<BrandsSelectionModalProps> = ({
	isOpen,
	onClose,
	allBrands,
	selectedBrands,
	onSelectBrand,
}) => {
	const [query, setQuery] = useState('')

	const filterBrands = allBrands
		.filter(
			(b) =>
				b.name.toLowerCase().includes(query.toLowerCase()) &&
				!selectedBrands.some((sb) => sb.id === b.id),
		)
		.sort((a, b) => a.name.localeCompare(b.name))

	return (
		<BaseModal isOpen={isOpen} onClose={onClose}>
			<div className='mt-4 space-y-4'>
				<DialogTitle
					as='h2'
					className='text-lg font-medium font-semibold leading-6 text-gray-900'
				>
					Manage Allowable Brands
				</DialogTitle>
				<div className='p-6'>
					<div className='relative mb-6'>
						<SearchInput
							value={query}
							onChange={setQuery}
							background=''
							className='text-gray-900'
						/>
					</div>
					<div className='max-h-80 overflow-y-auto'>
						<div className='space-y-3'>
							<h3 className='text-gray-900 font-bold'>Add Brands Here</h3>
							{filterBrands.length > 0 ? (
								filterBrands.map((brand) => (
									<div
										key={brand.id}
										className='flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition-colors'
									>
										<span className='text-lg font-medium text-gray-700'>
											{brand.name}
										</span>
										<Button
											actionType='neutral'
											onClick={() => onSelectBrand(brand)}
										>
											<PlusIcon className='w-4 h-4 mr-2' />
										</Button>
									</div>
								))
							) : (
								<p className='text-gray-500'>No brands found</p>
							)}
						</div>
					</div>
				</div>
			</div>
		</BaseModal>
	)
}

export default BrandsSelectionModal

'use client'

import React, { useRef } from 'react'
import { DialogTitle } from '@headlessui/react'
import BaseModal from '@/components/ui/BaseModal'

interface ConfirmationModalProps {
	isOpen: boolean
	title: string
	message: string
	confirmButtonText?: string
	cancelButtonText?: string
	confirmButtonClass?: string
	cancelButtonClass?: string
	onClose: () => void
	onConfirm: () => void
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
	isOpen,
	title,
	message,
	confirmButtonText = 'Confirm',
	cancelButtonText = 'Cancel',
	confirmButtonClass = 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
	cancelButtonClass = 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500',
	onClose,
	onConfirm,
}) => {
	const confirmButtonRef = useRef<HTMLButtonElement>(null)

	return (
		<BaseModal
			isOpen={isOpen}
			onClose={onClose}
			initialFocusRef={confirmButtonRef}
		>
			<DialogTitle
				as='h3'
				className='text-lg font-medium leading-6 text-gray-900'
			>
				{title}
			</DialogTitle>
			<div className='mt-2'>
				<p className='text-sm text-gray-500'>{message}</p>
			</div>
			<div className='mt-4 flex justify-end space-x-3'>
				<button
					type='button'
					className={`
                        inline-flex
                        justify-center
                        rounded-md
                        border
                        border-transparent
                        px-4
                        py-2
                        text-sm
                        font-medium
                        text-white
                        shadow-sm
                        focus:outline-non
                        focus:ring-2
                        focus:ring-offset-2
                        ${confirmButtonClass}
                    `}
					onClick={onConfirm}
					ref={confirmButtonRef}
				>
					{confirmButtonText}
				</button>
				<button
					type='button'
					className={`
                        inline-flex
                        just-center
                        rounded-md
                        border
                        border-transparent
                        px-4
                        py-2
                        text-sm
                        font-medium
                        ${cancelButtonClass}
                    `}
					onClick={onClose}
				>
					{cancelButtonText}
				</button>
			</div>
		</BaseModal>
	)
}

export default ConfirmationModal

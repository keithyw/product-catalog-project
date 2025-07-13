'use client'

import React, { Fragment, useRef } from 'react'
import {
	Dialog,
	DialogPanel,
	Transition,
	TransitionChild,
} from '@headlessui/react'

interface BaseModalProps {
	isOpen: boolean
	onClose: () => void
	children: React.ReactNode
	initialFocusRef?: React.RefObject<HTMLElement | null>
	panelClassName?: string
}

const BaseModal: React.FC<BaseModalProps> = ({
	isOpen,
	onClose,
	children,
	initialFocusRef,
	panelClassName = '',
}) => {
	const defaultFocusRef = useRef<HTMLElement>(null)

	return (
		<Transition appear show={isOpen} as={Fragment}>
			<Dialog
				as='div'
				onClose={onClose}
				className='relative z-50'
				initialFocus={initialFocusRef || defaultFocusRef}
			>
				<TransitionChild
					as={Fragment}
					enter='easy-out duration-300'
					enterFrom='opacity-0'
					enterTo='opacity-100'
					leave='easy-in duration-200'
					leaveFrom='opacity-100'
					leaveTo='opacity-0'
				>
					<div className='fixed inset-0 bg-black bg-opacity-25' />
				</TransitionChild>
				<div className='fixed inset-0 overflow-y-auto'>
					<div className='flex min-h-full items-center justify-center p-4 text-center'>
						<TransitionChild
							as={Fragment}
							enter='easy-out duration-300'
							enterFrom='opaicty-0 scale-95'
							enterTo='opacity-100 scale-100'
							leave='easy-in duration-200'
							leaveFrom='opacity-100 scale-100'
							leaveTo='opacity-0 scale-95'
						>
							<DialogPanel
								className={`
                                    w-full
                                    max-w-md
                                    transform
                                    overflow-hidden
                                    rounded-2xl
                                    bg-white
                                    p-6
                                    text-left
                                    align-middle
                                    shadow-xl
                                    transition-all
                                    ${panelClassName}
                                `}
							>
								{children}
							</DialogPanel>
						</TransitionChild>
					</div>
				</div>
			</Dialog>
		</Transition>
	)
}

export default BaseModal

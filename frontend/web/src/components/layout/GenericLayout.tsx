import React from 'react'
import PageTitle from '@/components/ui/PageTitle'

interface GenericLayoutProps {
	children: React.ReactNode
	title: string
}

export default function GenericLayout({ children, title }: GenericLayoutProps) {
	return (
		<div className='min-h-screen bg-gray-50'>
			<header className='bg-white shadow-sm py-4 px-6 flex justify-between items-centered'>
				<PageTitle>{title}</PageTitle>
			</header>
			<main className='container mx-auto py-8 px-4 sm:px-6 lg:px-8'>
				{children}
			</main>
		</div>
	)
}

import React from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'

interface CreateItemSectionProps {
	href: string
	children: React.ReactNode
}
const CreateItemSection: React.FC<CreateItemSectionProps> = ({
	href,
	children,
}) => {
	return (
		<div className='flex justify-end mb-4'>
			<Link href={href} passHref>
				<Button actionType='edit' type='button'>
					{children}
				</Button>
			</Link>
		</div>
	)
}

export default CreateItemSection

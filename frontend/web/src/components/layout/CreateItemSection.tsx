import React from 'react'
import Link from 'next/link'
import PermissionGuard from '@/components/auth/PermissionGuard'
import Button from '@/components/ui/Button'

interface CreateItemSectionProps {
	href: string
	permission?: string
	children: React.ReactNode
}
const CreateItemSection: React.FC<CreateItemSectionProps> = ({
	href,
	permission,
	children,
}) => {
	return (
		<PermissionGuard requiredPermission={permission}>
			<div className='flex justify-end mb-4'>
				<Link href={href} passHref>
					<Button actionType='edit' type='button'>
						{children}
					</Button>
				</Link>
			</div>
		</PermissionGuard>
	)
}

export default CreateItemSection

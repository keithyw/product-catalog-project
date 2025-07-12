'use client'

import Link from 'next/link'

export interface SubnavBarLink {
	href: string
	label: string
}

interface SubnavbarProps {
	links: SubnavBarLink[]
}

const Subnavbar: React.FC<SubnavbarProps> = ({ links }) => {
	return (
		<nav className='flex items-center space-x-6'>
			{links.map((link, index) => (
				<Link
					href={`${link.href}`}
					key={index}
					className='text-blue-600 hover:text-blue-600 font-medium transition-colors'
				>
					{link.label}
				</Link>
			))}
		</nav>
	)
}

export default Subnavbar

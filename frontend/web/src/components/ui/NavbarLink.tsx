import Link from 'next/link'

interface NavbarLinkProps {
	href: string
	className?: string
	children: React.ReactNode
}

const NavbarLink: React.FC<NavbarLinkProps> = ({
	href,
	className = '',
	children,
}) => {
	return (
		<Link
			href={href}
			className={`hover:text-gray-300 transition-colors duration-200 ${className}`}
		>
			{children}
		</Link>
	)
}

export default NavbarLink

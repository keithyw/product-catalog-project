import Link from 'next/link'
import PermissionGuard from '@/components/auth/PermissionGuard'

interface NavbarLinkProps {
	href: string
	className?: string
	permission?: string
	children: React.ReactNode
}

const NavbarLink: React.FC<NavbarLinkProps> = ({
	href,
	className = '',
	permission = '',
	children,
}) => {
	return (
		<PermissionGuard requiredPermission={permission}>
			<Link
				href={href}
				className={`hover:text-gray-300 transition-colors duration-200 ${className}`}
			>
				{children}
			</Link>
		</PermissionGuard>
	)
}

export default NavbarLink

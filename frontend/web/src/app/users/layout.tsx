import { GROUPS_URL, PERMISSIONS_URL, USERS_URL } from '@/lib/constants'
import CrudLayout from '@/components/layout/CrudLayout'
import { SubnavBarLink } from '@/components/layout/Subnavbar'

export default function UsersPage({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const links: SubnavBarLink[] = [
		{
			href: `${USERS_URL}`,
			label: 'Users',
		},
		{
			href: `${GROUPS_URL}`,
			label: 'Groups',
		},
		{
			href: `${PERMISSIONS_URL}`,
			label: 'Permissions',
		},
	]
	return (
		<CrudLayout links={links} title='User Management'>
			{children}
		</CrudLayout>
	)
}

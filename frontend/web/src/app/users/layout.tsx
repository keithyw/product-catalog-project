import { GROUPS_URL, PERMISSIONS_URL, USERS_URL } from '@/lib/constants'
import CrudLayout from '@/components/layout/CrudLayout'
import { SubnavBarLink } from '@/components/layout/Subnavbar'
import {
	GROUP_PERMISSIONS,
	PERMISSION_PERMISSIONS,
	USER_PERMISSIONS,
} from '@/lib/constants/permissions'

export default function UsersPage({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const links: SubnavBarLink[] = [
		{
			href: `${USERS_URL}`,
			label: 'Users',
			permission: USER_PERMISSIONS.VIEW,
		},
		{
			href: `${GROUPS_URL}`,
			label: 'Groups',
			permission: GROUP_PERMISSIONS.VIEW,
		},
		{
			href: `${PERMISSIONS_URL}`,
			label: 'Permissions',
			permission: PERMISSION_PERMISSIONS.VIEW,
		},
	]
	return (
		<CrudLayout links={links} title='User Management'>
			{children}
		</CrudLayout>
	)
}

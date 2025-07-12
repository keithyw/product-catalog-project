import { USERS_URL } from '@/lib/constants'
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
			label: 'User List',
		},
		{
			href: `${USERS_URL}/create`,
			label: 'Create User',
		},
	]
	return (
		<CrudLayout links={links} title='User Management'>
			{children}
		</CrudLayout>
	)
}

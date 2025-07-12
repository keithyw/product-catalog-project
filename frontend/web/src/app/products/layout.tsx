import { PRODUCTS_URL } from '@/lib/constants'
import CrudLayout from '@/components/layout/CrudLayout'
import { SubnavBarLink } from '@/components/layout/Subnavbar'

export default function ProductsLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const links: SubnavBarLink[] = [
		{
			href: `${PRODUCTS_URL}`,
			label: 'Product List',
		},
		{
			href: `${PRODUCTS_URL}/create`,
			label: 'Create Product',
		},
	]
	return (
		<CrudLayout links={links} title='Product Catalog'>
			{children}
		</CrudLayout>
	)
}

import { PRODUCTS_URL, PRODUCT_ATTIBUTES_URL } from '@/lib/constants'
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
			label: 'Products',
		},
		{
			href: `${PRODUCT_ATTIBUTES_URL}`,
			label: 'Product Attributes',
		},
	]
	return (
		<CrudLayout links={links} title='Product Management'>
			{children}
		</CrudLayout>
	)
}

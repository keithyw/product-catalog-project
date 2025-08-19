import {
	PRODUCTS_URL,
	PRODUCTS_AI_TOOLS_URL,
	PRODUCT_ATTRIBUTES_URL,
	PRODUCT_ATTRIBUTE_SETS_URL,
} from '@/lib/constants'
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
			href: `${PRODUCTS_AI_TOOLS_URL}`,
			label: 'AI Gen',
		},
		{
			href: `${PRODUCT_ATTRIBUTES_URL}`,
			label: 'Attributes',
		},
		{
			href: `${PRODUCT_ATTRIBUTE_SETS_URL}`,
			label: 'Attribute Sets',
		},
	]
	return (
		<CrudLayout links={links} title='Product Management'>
			{children}
		</CrudLayout>
	)
}

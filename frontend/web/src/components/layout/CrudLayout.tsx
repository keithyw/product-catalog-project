import Subnavbar, { SubnavBarLink } from '@/components/layout/Subnavbar'

interface CrudLayoutProps {
	children: React.ReactNode
	links: SubnavBarLink[]
	title: string
}

const CrudLayout: React.FC<CrudLayoutProps> = ({ children, links, title }) => {
	return (
		<div className='min-h-screen bg-gray-50'>
			<header className='bg-white shadow-sm py-4 px-6 flex justify-between items-centered'>
				<h1 className='text-2xl font-semibold text-gray-800'>{title}</h1>
				<Subnavbar links={links} />
			</header>
			<main className='container mx-auto py-8 px-4 sm:px-6 lg:px-8'>
				{children}
			</main>
		</div>
	)
}

export default CrudLayout

interface PageTitleProps {
	children: React.ReactNode
	className?: string
}

const PageTitle: React.FC<PageTitleProps> = ({ children, className }) => {
	return (
		<h1
			className={`text-4xl font-extrabold text-gray-900 mb-6 text-center ${className || ''}`}
		>
			{children}
		</h1>
	)
}

export default PageTitle

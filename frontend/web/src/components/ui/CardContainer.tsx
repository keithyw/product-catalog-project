interface CardContainerProps {
	children: React.ReactNode
	className?: string
}

const CardContainer: React.FC<CardContainerProps> = ({
	children,
	className,
}) => {
	return (
		<div
			className={`container bg-white p-8 rounded-lg shadow-md mx-auto ${className || ''}`}
		>
			{children}
		</div>
	)
}

export default CardContainer

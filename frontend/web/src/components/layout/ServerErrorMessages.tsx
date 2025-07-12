interface ServerErrorMessagesProps {
	errorMessages: string
}

const ServerErrorMessages: React.FC<ServerErrorMessagesProps> = ({
	errorMessages,
}) => {
	return (
		<div
			className='bg-red-100 border-red-400 text-red-700 px-4 py-3 rounded relative mb-4'
			role='alert'
		>
			<strong className='font-bold'>Errors</strong>
			<span className='block sm:inline'>{errorMessages}</span>
		</div>
	)
}

export default ServerErrorMessages

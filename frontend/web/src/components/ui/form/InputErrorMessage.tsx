interface InputErrorMessageProps {
	errorMessage: string
}

const InputErrorMessage: React.FC<InputErrorMessageProps> = ({
	errorMessage,
}) => {
	if (!errorMessage) {
		return null
	}
	return <p className='text-red-500 text-xs italic mb-2'>{errorMessage}</p>
}

export default InputErrorMessage

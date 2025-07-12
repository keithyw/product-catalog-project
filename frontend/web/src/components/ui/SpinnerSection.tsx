import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface SpinnerSectionProps {
	spinnerMessage: string
}

const SpinnerSection: React.FC<SpinnerSectionProps> = ({ spinnerMessage }) => {
	return (
		<div className='flex justify-center items-center min-h-[50vh]'>
			<LoadingSpinner message={spinnerMessage} size='lg' />
		</div>
	)
}

export default SpinnerSection

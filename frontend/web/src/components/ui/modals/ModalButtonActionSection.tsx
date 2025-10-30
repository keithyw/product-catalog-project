import React from 'react'

interface ModalButtonActionSectionProps {
	children: React.ReactNode
}
const ModalButtonActionSection = ({
	children,
}: ModalButtonActionSectionProps) => {
	return <div className='mt-4 flex justify-end space-x-3'>{children}</div>
}

export default ModalButtonActionSection

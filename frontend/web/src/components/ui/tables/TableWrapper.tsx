import React from 'react'

interface TableWrapperProps {
	children: React.ReactNode
}

const TableWrapper: React.FC<TableWrapperProps> = ({ children }) => {
	return (
		<div className='shadow-md sm:rounded-lg'>
			<table className='w-full text-sm text-left text-gray-500 data:text-gray-400'>
				{children}
			</table>
		</div>
	)
}

export default TableWrapper

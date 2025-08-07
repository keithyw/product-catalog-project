import React from 'react'

interface EmptyDataRowProps {
	colspan: number
}

const EmptyDataRow: React.FC<EmptyDataRowProps> = ({ colspan }) => {
	return (
		<tr>
			<td colSpan={colspan} className='text-center py-4 text-gray-500'>
				No data
			</td>
		</tr>
	)
}

export default EmptyDataRow

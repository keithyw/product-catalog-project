import React from 'react'
import { TrashIcon } from '@heroicons/react/24/solid'
import Button from '@/components/ui/form/Button'

interface RemoveRowCellProps {
	id: string
	onRemoveRow: (id: string) => void
}

const RemoveRowCell: React.FC<RemoveRowCellProps> = ({ id, onRemoveRow }) => {
	return (
		<td className='px-6 py-4'>
			<Button
				actionType='danger'
				title='Remove Row'
				onClick={() => onRemoveRow(id)}
				className='p-2 rounded-md transitio-colors duration-200'
			>
				<TrashIcon className='h-4 w-4 text-white' />
			</Button>
		</td>
	)
}

export default RemoveRowCell

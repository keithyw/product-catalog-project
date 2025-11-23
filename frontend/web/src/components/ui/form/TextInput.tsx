import { forwardRef } from 'react'

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	id: string
	label: string
	type?: string
	className?: string
	readOnly?: boolean
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
	({ id, label, type = 'text', className = '', readOnly, ...rest }, ref) => {
		return (
			<div className='mb-4 relative'>
				<label
					htmlFor={id}
					className='block text-gray-700 text-sm font-bold mb-2'
				>
					{label}
				</label>
				<input
					type={type}
					id={id}
					ref={ref}
					readOnly={readOnly}
					{...rest}
					className={`
						shadow 
						appearance-none
						border 
						rounded 
						w-full 
						py-2
						px-3
						text-gray-700
						leading-tight
						focus:outline-none
						focus:shadow-outline
						focus:border-blue-500
						${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}
                    	${className || ''}
					`}
				/>
			</div>
		)
	},
)

TextInput.displayName = 'TextInput'

export default TextInput

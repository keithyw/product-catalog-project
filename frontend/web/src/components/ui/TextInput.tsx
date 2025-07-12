import { forwardRef } from 'react'

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	id: string
	label: string
	className?: string
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
	({ id, label, className = '', ...rest }, ref) => {
		return (
			<div className='mb-4'>
				<label
					htmlFor={id}
					className='block text-gray-700 text-sm font-bold mb-2'
				>
					{label}
				</label>
				<input
					type='text'
					id={id}
					ref={ref}
					{...rest}
					className={`shadow 
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
                    ${className || ''}`}
				/>
			</div>
		)
	},
)

TextInput.displayName = 'TextInput'

export default TextInput

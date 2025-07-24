import React, { forwardRef } from 'react'

interface TextareaInputProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	id: string
	label: string
	className?: string
	readOnly?: boolean
}

const TextareaInput = forwardRef<HTMLTextAreaElement, TextareaInputProps>(
	({ id, label, className = '', readOnly, ...rest }, ref) => {
		return (
			<div className='mb-4'>
				<label
					htmlFor={id}
					className='block text-gray-700 text-sm font-bold mb-2'
				>
					{label}
				</label>
				<textarea
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

TextareaInput.displayName = 'TextareaInput'

export default TextareaInput

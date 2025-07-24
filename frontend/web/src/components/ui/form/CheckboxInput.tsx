import React, { forwardRef } from 'react'

interface CheckboxInputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	id: string
	label: string
	className?: string
}

const CheckboxInput = forwardRef<HTMLInputElement, CheckboxInputProps>(
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
					id={id}
					type='checkbox'
					ref={ref}
					{...rest}
					className={`
                        form-checkbox
                        h-5
                        w-5
                        text-blue-600
                        ${className}
                    `}
				/>
			</div>
		)
	},
)

CheckboxInput.displayName = 'CheckboxInput'

export default CheckboxInput

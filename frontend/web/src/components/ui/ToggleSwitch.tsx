import React from 'react'

interface ToggleSwitchProps {
	id: string
	checked: boolean
	onChange: (checked: boolean) => void
	label?: string
	disabled?: boolean
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
	id,
	checked,
	onChange,
	label,
	disabled,
}) => {
	return (
		<div className='flex items-center space-x-2'>
			{label && (
				<label
					htmlFor={id}
					className={`text-gray-700 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
				>
					{label}
				</label>
			)}
			<label
				htmlFor={id}
				className='relative inline-flex items-center cursor-pointer'
			>
				<input
					type='checkbox'
					id={id}
					className='sr-only peer'
					checked={checked}
					onChange={(e) => onChange(e.target.checked)}
					disabled={disabled}
				/>
				<div
					className={`
                        w-11
                        h-6
                        bg-gray-200
                        rounded-full
                        peer
                        peer-focus:outline-none
                        peer-focus:ring-4
                        peer-focus:ring-blue-300
                        peer-checked:after:translate-x-full
                        peer-checked:after:border-white
                        after:content-['']
                        after:absolute
                        after:top-[2px]
                        after:left-[2px]
                        after:bg-white
                        after:border-gray-300
                        after:border
                        after:rounded-full
                        after:h-5
                        after:w-5
                        after:transition-all
                        peer-checked:bg-blue-600
                        ${disabled ? 'cursor-not-allowed' : ''}
                    `}
				/>
			</label>
		</div>
	)
}

export default ToggleSwitch

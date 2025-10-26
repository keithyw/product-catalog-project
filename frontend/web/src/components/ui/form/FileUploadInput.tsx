import React from 'react'

interface FileUploadInputProps {
	label: string
	onChange: (file: File | null) => void
	currentFile: File | null
}

const FileUploadInput = ({
	label,
	onChange,
	currentFile,
}: FileUploadInputProps) => {
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files ? e.target.files[0] : null
		onChange(file)
	}
	return (
		<div className='flex flex-col space-y-2'>
			<label className='text- sm font-medium text-gray-700'>{label}</label>
			<input
				type='file'
				onChange={handleFileChange}
				className='
                    block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100
                '
			/>
			{currentFile && (
				<p className='text-xs text-gray-500 mt-1'>
					Selected: {currentFile.name}
				</p>
			)}
		</div>
	)
}

export default FileUploadInput

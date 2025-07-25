import React, { useEffect, useMemo, useState } from 'react'
import { Control, Controller, Path, useWatch } from 'react-hook-form'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import InputErrorMessage from '@/components/ui/form/InputErrorMessage'
import CategoryTreeSelectorModal from '@/components/ui/modals/CategoryTreeSelectorModal'
import categoryService from '@/lib/services/category'
import { Category } from '@/types/category'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ParentCategorySelectorProps<T extends Record<string, any>> {
	name: keyof T
	control: Control<T>
	label: string
	placeholder?: string
	errorMessage?: string
	required?: boolean
	readOnly?: boolean
	selectedCategorySystemId: number | string | null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ParentCategorySelector = <T extends Record<string, any>>({
	name,
	control,
	label,
	placeholder,
	errorMessage,
	required,
	readOnly,
	selectedCategorySystemId,
}: ParentCategorySelectorProps<T>) => {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [categories, setCategories] = useState<Category[]>([])
	const [isLoadingCategories, setIsLoadingCategories] = useState(false)
	const [loadingError, setLoadingError] = useState<string | null>(null)

	const openModal = () => setIsModalOpen(true)
	const closeModal = () => setIsModalOpen(false)

	const currentParentId = useWatch({
		control,
		name: name as Path<T>,
	})

	useEffect(() => {
		setLoadingError(null)
		if (selectedCategorySystemId) {
			const fetchCategories = async () => {
				setIsLoadingCategories(true)
				try {
					const res = await categoryService.getBySystemId(
						selectedCategorySystemId as number,
					)
					setCategories(res)
					setLoadingError(null)
				} catch (e: unknown) {
					if (e instanceof Error) {
						console.error(e.message)
						setLoadingError('Failed to load categories')
						setCategories([])
					}
				} finally {
					setIsLoadingCategories(false)
				}
			}
			fetchCategories()
		} else {
			setCategories([])
			setLoadingError('Select a category system first')
			setIsLoadingCategories(false)
		}
	}, [selectedCategorySystemId])

	const selectedParentName = useMemo(() => {
		if (currentParentId === null || currentParentId === undefined) {
			return null
		}
		const parentCategory = categories.find((c) => c.id === currentParentId)
		return parentCategory ? parentCategory.name : null
	}, [categories, currentParentId])
	const displayValue = selectedParentName || placeholder
	const isDisabled =
		readOnly || isLoadingCategories || !selectedCategorySystemId
	const displayClass = isDisabled
		? 'bg-gray-100 cursor-not-allowed'
		: 'bg-white cursor-pointer'

	return (
		<Controller
			name={name as Path<T>}
			control={control}
			rules={{ required: required }}
			render={({ field }) => {
				return (
					<div className='mb-4'>
						<label
							htmlFor={name as string}
							className='block text-gray-700 text-sm font-bold mb-2'
						>
							{label}
						</label>
						<div className='flex items-center space-x-2'>
							<div className='relative flex-grow'>
								<input
									id={name as string}
									type='text'
									onClick={isDisabled ? undefined : openModal}
									readOnly
									value={displayValue}
									className={`
                                        shadow
                                        appearance-none
                                        border
                                        rounded
                                        w-full
                                        py-2
                                        pl-3
                                        pr-10
                                        text-gray-700
                                        leading-tight
                                        focus:outline-none
                                        focus:shadow-outline
                                        focus:border-blue-500
                                        ${displayClass}
                                    `}
								/>
								{!isDisabled && (
									<MagnifyingGlassIcon
										className='
                                            absolute
                                            right-3
                                            top-5
                                            -translate-y-1/2
                                            h-5
                                            w-5
                                            text-gray-400
                                            pointer-events-none
                                        '
									/>
								)}
							</div>
							<button
								type='button'
								onClick={openModal}
								disabled={isDisabled}
								className={`
                                        inline-flex
                                        justify-center
                                        rounded-md
                                        border
                                        border-transparent
                                        bg-blue-600
                                        px-4
                                        py-2
                                        text-sm
                                        font-medium
                                        text-white
                                        shadow-sm
                                        hover:bg-blue-700
                                        focus:outline-none
                                        focus:ring-2
                                        focus:ring-offset-2
                                        focus:ring-blue-500
                                        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                                    `}
							>
								Select
							</button>
						</div>
						{errorMessage && <InputErrorMessage errorMessage={errorMessage} />}
						{loadingError && !isDisabled && (
							<p className='mt-1 text-sm text-red-600'>{loadingError}</p>
						)}
						<CategoryTreeSelectorModal
							isOpen={isModalOpen}
							onClose={closeModal}
							onSelectParent={(parentId) => {
								field.onChange(parentId)
							}}
							selectedCategorySystemId={selectedCategorySystemId}
							currentParentId={currentParentId as number | null}
						/>
					</div>
				)
			}}
		/>
	)
}

export default ParentCategorySelector

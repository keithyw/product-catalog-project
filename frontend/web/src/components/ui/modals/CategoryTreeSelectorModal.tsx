import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { DialogTitle } from '@headlessui/react'
import {
	CheckIcon,
	ChevronDownIcon,
	ChevronRightIcon,
	MagnifyingGlassIcon,
	XMarkIcon,
} from '@heroicons/react/20/solid'
import SpinnerSection from '@/components/ui/SpinnerSection'
import BaseModal from '@/components/ui/modals/BaseModal'
import categoryService from '@/lib/services/category'
import { Category, CategoryTreeNode } from '@/types/category'

interface CategoryTreeSelectorModalProps {
	isOpen: boolean
	onClose: () => void
	onSelectParent: (parentId: number | null, parentName: string) => void
	selectedCategorySystemId: number | string | null
	currentParentId?: number | null
}

const buildTree = (flatCategories: Category[]): CategoryTreeNode[] => {
	const nodes: { [key: number]: CategoryTreeNode } = {}
	const roots: CategoryTreeNode[] = []

	flatCategories.forEach((cat) => {
		const parentId =
			typeof cat.parent == 'string' ? parseInt(cat.parent, 10) : cat.parent
		nodes[cat.id] = { ...cat, parent: parentId, children: [] }
	})

	flatCategories.forEach((cat) => {
		const parentId =
			typeof cat.parent === 'string' ? parseInt(cat.parent, 10) : cat.parent
		if (parentId !== null && nodes[parentId]) {
			nodes[parentId].children.push(nodes[cat.id])
		} else {
			roots.push(nodes[cat.id])
		}
	})

	const sortNodes = (a: CategoryTreeNode, b: CategoryTreeNode) => {
		if (a.display_order !== undefined && b.display_order !== undefined) {
			if (a.display_order < b.display_order) return -1
			if (a.display_order > b.display_order) return 1
		}
		return a.name.localeCompare(b.name)
	}
	roots.sort(sortNodes)
	Object.values(nodes).forEach((node) => node.children.sort(sortNodes))
	return roots
}

interface CategoryTreeNodeComponentProps {
	node: CategoryTreeNode
	selectedNodeId: number | null
	onNodeSelect: (id: number | null, name: string | null) => void
	level: number
	searchTerm: string
	isExpanded: boolean
	onToggleExpand: (nodeId: number) => void
	isSearchResult: boolean
}

const CategoryTreeNodeComponent: React.FC<CategoryTreeNodeComponentProps> = ({
	node,
	selectedNodeId,
	onNodeSelect,
	level,
	searchTerm,
	isExpanded,
	onToggleExpand,
	isSearchResult,
}) => {
	const isSelected = selectedNodeId === node.id
	const hasChildren = node.children && node.children.length > 0

	if (searchTerm && !isSearchResult) {
		return null
	}

	return (
		<div className='py-1'>
			<div
				className={`
                    flex
                    items-center
                    rounded-md
                    px-2
                    py-1
                    cursor-pointer
                    transition-colors
                    duration-150
                    ease-in-out
                    ${isSelected ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}
                    ${level > 0 ? `ml-${level * 4}` : ''} 
                `}
				onClick={() => onNodeSelect(node.id, node.name)}
			>
				{hasChildren && (
					<button
						type='button'
						className='
                            flex-shrink-0
                            p-1
                            ml-1
                            mr-1
                            rounded-full
                            hover:bg-gray-200
                            focus:outline-none
                            focus:ring-2
                            focus:ring-blue-500
                        '
						onClick={(e) => {
							e.stopPropagation()
							onToggleExpand(node.id)
						}}
					>
						{isExpanded ? (
							<ChevronDownIcon className='h-4 w-4 text-gray-500' />
						) : (
							<ChevronRightIcon className='h-4 w-4 text-gray-500' />
						)}
					</button>
				)}
				{!hasChildren && <span className='flex-shrink-0 w-6' />}

				<span
					className={`flex-grow text-sm ${isSelected ? 'font-semibold' : 'font-normal text-gray-800'}`}
				>
					{node.name}
				</span>
				{isSelected && (
					<CheckIcon
						className='h-5 w-5 ml-2 flex-shrink-0'
						aria-hidden='true'
					/>
				)}
			</div>

			{isExpanded && hasChildren && (
				<div className='pl-4'>
					{node.children.map((child) => (
						<CategoryTreeNodeComponent
							key={child.id}
							node={child}
							selectedNodeId={selectedNodeId}
							onNodeSelect={onNodeSelect}
							level={level + 1}
							searchTerm={searchTerm}
							isExpanded={isExpanded}
							onToggleExpand={onToggleExpand}
							isSearchResult={isSearchResult}
						/>
					))}
				</div>
			)}
		</div>
	)
}

const CategoryTreeSelectorModal: React.FC<CategoryTreeSelectorModalProps> = ({
	isOpen,
	onClose,
	onSelectParent,
	selectedCategorySystemId,
	currentParentId,
}) => {
	const [flatCategories, setFlatCategories] = useState<Category[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [selectedParent, setSelectedParent] = useState<{
		id: number | null
		name: string | null
	}>({ id: null, name: null })
	const [error, setError] = useState<string | null>(null)
	const [searchTerm, setSearchTerm] = useState('')
	const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set())

	useEffect(() => {
		if (!isOpen || !selectedCategorySystemId) {
			setFlatCategories([])
			setIsLoading(false)
			return
		}

		const fetchCategories = async () => {
			setIsLoading(true)
			setError(null)
			try {
				const res = await categoryService.getBySystemId(
					selectedCategorySystemId as number,
				)
				setFlatCategories(res)
				if (currentParentId !== undefined && currentParentId !== null) {
					const parentNode = res.find((c) => c.id === currentParentId)
					if (parentNode) {
						setSelectedParent({ id: parentNode.id, name: parentNode.name })
						let curr: Category | null = parentNode
						const ancestors = new Set<number>()
						while (curr && curr.parent) {
							ancestors.add(curr.parent)
							curr = res.find((c) => c.id === curr?.parent) || null
						}
						setExpandedNodes((prev) => new Set([...prev, ...ancestors]))
					}
				} else {
					setSelectedParent({ id: null, name: null })
				}
			} catch (e: unknown) {
				console.error(e)
				setError('Failed to load categories')
			} finally {
				setIsLoading(false)
			}
		}
		fetchCategories()
	}, [currentParentId, isOpen, selectedCategorySystemId])

	const categoryTree = useMemo(() => {
		return buildTree(flatCategories)
	}, [flatCategories])

	const filteredTree = useMemo(() => {
		if (!searchTerm) {
			return categoryTree
		}
		const lowerCaseSearchTerm = searchTerm.toLowerCase()
		const filterNodes = (nodes: CategoryTreeNode[]): CategoryTreeNode[] => {
			return nodes
				.filter((node) => {
					const matches = node.name.toLowerCase().includes(lowerCaseSearchTerm)
					const childrenMatch = filterNodes(node.children)
					if (matches || childrenMatch.length > 0) {
						return { ...node, children: childrenMatch }
					}
					return null
				})
				.filter(Boolean) as CategoryTreeNode[]
		}
		return filterNodes(categoryTree)
	}, [categoryTree, searchTerm])

	const doesNodeOrChildMatch = useCallback(
		(node: CategoryTreeNode, term: string): boolean => {
			if (!term) return true
			const lowerCaseTerm = term.toLowerCase()
			if (node.name.toLowerCase().includes(lowerCaseTerm)) {
				return true
			}
			return node.children.some((child) => doesNodeOrChildMatch(child, term))
		},
		[],
	)

	const handleNodeSelect = (id: number | null, name: string | null) => {
		setSelectedParent({ id, name })
	}

	const handleConfirm = () => {
		onSelectParent(selectedParent.id, selectedParent.name as string)
		onClose()
	}

	const handleToggleExpand = (nodeId: number) => {
		setExpandedNodes((prev) => {
			const newSet = new Set(prev)
			if (newSet.has(nodeId)) {
				newSet.delete(nodeId)
			} else {
				newSet.add(nodeId)
			}
			return newSet
		})
	}

	return (
		<BaseModal isOpen={isOpen} onClose={onClose} panelClassName='max-w-lg'>
			<DialogTitle
				as='h3'
				className='text-lg font-medium leading-6 text-gray-900 flex justify-between items-center'
			>
				Select Parent Category
				<button
					type='button'
					disabled={isLoading}
					onClick={onClose}
					className='
                        inline-flex
                        justify-center
                        rounded-md
                        border
                        border-transparent
                        bg-gray-100
                        px-2
                        py-1
                        text-sm
                        font-medium
                        text-gray-700
                        hover:bg-gray-200
                        focus:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-blue-500
                        focus-visible:ring-offset-2
                    '
				>
					<XMarkIcon className='h-5 w-5' />
				</button>
			</DialogTitle>
			<div className='mt-4'>
				<div className='relative mb-4'>
					<input
						type='text'
						placeholder='Search categories...'
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className='
                            w-full
                            rounded-md
                            border
                            border-gray-300
                            py-2
                            pl-10
                            pr-3
                            text-sm
                            text-gray-700
                            focus:border-blue-500
                            focus:ring-blue-500
                        '
					/>
					<MagnifyingGlassIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' />
				</div>

				<div
					onClick={() => handleNodeSelect(null, null)}
					className={`
                        flex
                        items-center
                        p-2
                        rounded-md
                        cursor-pointer
                        mb-4
                        transition-colors
                        duration-150
                        ease-in-out
                        ${selectedParent.id === null ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}
                    `}
				>
					<span
						className={`
                            text-sm
                            ${selectedParent.id === null ? 'font-semibold' : 'font-normal'}
                        `}
					>
						[No Parent] (Create as Root Category)
					</span>
					{selectedParent.id === null && (
						<CheckIcon
							className='h-5 w-5 ml-2 flex-shrink-0'
							aria-hidden='true'
						/>
					)}
				</div>

				<div>
					{isLoading ? (
						<SpinnerSection spinnerMessage='Loading categories...' />
					) : error ? (
						<div className='text-center text-red-500'>{error}</div>
					) : filteredTree.length === 0 ? (
						<div className='text-center text-gray-500'>No categories found</div>
					) : (
						filteredTree.map((node) => (
							<CategoryTreeNodeComponent
								key={node.id}
								node={node}
								selectedNodeId={selectedParent.id}
								onNodeSelect={handleNodeSelect}
								level={0}
								searchTerm={searchTerm}
								isExpanded={expandedNodes.has(node.id) || !!searchTerm}
								onToggleExpand={handleToggleExpand}
								isSearchResult={doesNodeOrChildMatch(node, searchTerm)}
							/>
						))
					)}
				</div>
			</div>

			<div className='mt-6 flex justify-between items-center'>
				<div className='text-sm text-gray-600'>
					Selected:
					<span className='font-semibold text-blue-700'>
						{selectedParent.name || '[No Parent]'}
					</span>
				</div>
				<div className='flex space-x-2'>
					<button
						type='button'
						onClick={onClose}
						className='
                            inline-flex
                            justify-center
                            rounded-md
                            border-gray-300
                            bg-white
                            px-4
                            py-2
                            text-sm
                            font-medium
                            text-gray-700
                            shadow-sm
                            hover:bg-gray-50
                            focus:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-blue-500
                            focus-visible:ring-offset-2
                        '
					>
						Cancel
					</button>
					<button
						type='button'
						onClick={handleConfirm}
						disabled={isLoading}
						className='
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
                            focus-visible:ring-2
                            focus-visible:ring-blue-500
                            focus-visible:ring-offset-2
                        '
					>
						Confirm Selection
					</button>
				</div>
			</div>
		</BaseModal>
	)
}

export default CategoryTreeSelectorModal

import React, { Fragment } from 'react'
import {
	Menu,
	MenuButton,
	MenuItem,
	MenuItems,
	Transition,
} from '@headlessui/react'
import {
	Bars3Icon,
	PencilIcon,
	EyeIcon,
	ShieldCheckIcon,
	TrashIcon,
	UserGroupIcon,
} from '@heroicons/react/24/outline'
import type { TableRowAction, TableRowActionType } from '@/types/table'
import { usePermissions } from '@/lib/hooks/usePermissions'

const ICON_MAP: Record<TableRowActionType, React.ReactNode> = {
	view: <EyeIcon className='w-5 h-5 mr-2' />,
	edit: <PencilIcon className='w-5 h-5 mr-2' />,
	delete: <TrashIcon className='w-5 h-5 mr-2 text-red-500' />,
	permissionGroup: <ShieldCheckIcon className='w-5 h-5 mr-2' />,
	userGroup: <UserGroupIcon className='w-5 h-5 mr-2' />,
	custom: null,
}

export function RowActionsMenu<T>({
	actions,
	row,
}: {
	actions: TableRowAction<T>[]
	row: T
}) {
	const [openUpwards, setOpenUpwards] = React.useState(false)
	const buttonRef = React.useRef<HTMLButtonElement>(null)
	const { checkAccess } = usePermissions()

	const handleOpen = () => {
		if (buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect()
			const spaceBelow = window.innerHeight - rect.bottom
			const menuHeight = 240
			setOpenUpwards(spaceBelow < menuHeight)
		}
	}

	// Filter actions based on permissions
	const filteredActions = actions.filter((action) => {
		// If no permission requirements, show the action
		if (
			!action.requiredPermission &&
			!action.requiredPermissions &&
			!action.anyPermission &&
			!action.requiredGroup &&
			!action.requiredGroups &&
			!action.anyGroup &&
			!action.requireStaff &&
			!action.requireActive
		) {
			return true
		}

		// Check permissions using the checkAccess function
		return checkAccess({
			requiredPermission: action.requiredPermission,
			requiredPermissions: action.requiredPermissions,
			anyPermission: action.anyPermission,
			requiredGroup: action.requiredGroup,
			requiredGroups: action.requiredGroups,
			anyGroup: action.anyGroup,
			requireStaff: action.requireStaff,
			requireActive: action.requireActive,
		})
	})

	if (!filteredActions || filteredActions.length === 0) return null

	return (
		<Menu as='div' className='relative inline-block text-left'>
			<MenuButton
				ref={buttonRef}
				onClick={handleOpen}
				className='p-2 rounded hover:bg-gray-100'
			>
				<Bars3Icon className='w-5 h-5' aria-hidden='true' />
				<span className='sr-only'>Open actions menu</span>
			</MenuButton>
			<Transition
				as={Fragment}
				enter='transition ease-out duration-100'
				enterFrom='transform opacity-0 scale-95'
				enterTo='transform opacity-100 scale-100'
				leave='transition ease-in duration-75'
				leaveFrom='transform opacity-100 scale-100'
				leaveTo='transform opacity-0 scale-95'
			>
				<MenuItems
					className={`
                        absolute 
                        right-0 
                        z-50
                        w-44
                        origin-top-right 
                        rounded-md 
                        bg-white 
                        shadow-lg 
                        ring-1 
                        ring-black 
                        ring-opacity-5 
                        focus:outline-none
                        max-h-60
                        overflow-auto
                        ${openUpwards ? 'bottom-full mb-2' : 'mt-2'}
                    `}
				>
					{filteredActions.map((action, idx) => (
						<MenuItem
							key={idx}
							as='button'
							className={({ active }) =>
								`${active ? 'bg-gray-100' : ''}
                                flex
                                items-center
                                w-full
                                px-4
                                py-2
                                text-sm
                                text-gray-700
                                hover:bg-gray-100
                                focus:outline-none
                                focus:ring-2
                                focus:ring-offset-2
                                focus:ring-indigo-500
                                transition-colors
                                duration-200
                            `
							}
							onClick={() => action.onClick(row)}
						>
							{action.icon ||
								(action.actionType &&
									ICON_MAP[action.actionType as TableRowActionType])}
							{action.label}
						</MenuItem>
					))}
				</MenuItems>
			</Transition>
		</Menu>
	)
}

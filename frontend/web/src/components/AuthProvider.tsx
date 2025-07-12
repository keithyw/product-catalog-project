'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
	DASHBOARD_URL,
	LOGIN_URL,
	PROTECTED_ROUTES,
	PUBLIC_ROUTES,
} from '@/lib/constants'
import useAuthStore from '@/stores/useAuthStore'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface AuthProviderProps {
	children: ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
	const { isAuthenticated, isLoading, checkIfAuthenticated } = useAuthStore()

	const router = useRouter()
	const pathname = usePathname()

	useEffect(() => {
		checkIfAuthenticated()
	}, [checkIfAuthenticated])

	useEffect(() => {
		if (isLoading) return

		const isProtected = PROTECTED_ROUTES.some((path) =>
			pathname.startsWith(path),
		)
		const isAuthPage = PUBLIC_ROUTES.includes(pathname)

		if (isProtected && !isAuthenticated) {
			router.replace(LOGIN_URL)
		} else if (isAuthPage && isAuthenticated) {
			router.replace(process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL || DASHBOARD_URL)
		}
	}, [isAuthenticated, isLoading, pathname, router])

	const isProtected = PROTECTED_ROUTES.some((path) => pathname.startsWith(path))
	if (isLoading && isProtected) {
		return <LoadingSpinner />
	}

	return <>{children}</>
}

import React from 'react'
import GenericLayout from '@/components/layout/GenericLayout'

export default function ProfileLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return <GenericLayout title='My Profile'>{children}</GenericLayout>
}

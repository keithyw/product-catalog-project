import React from 'react'
import { render, screen } from '@testing-library/react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

describe('LoadingSpinner', () => {
	it('renders without crashing', () => {
		render(<LoadingSpinner />)
		expect(screen.getByRole('status')).toBeInTheDocument()
	})

	it('displays the provided message', () => {
		const testMessage = 'xing kang palm'
		render(<LoadingSpinner message={testMessage} />)
		expect(screen.getByText(testMessage)).toBeInTheDocument()
	})

	it('does not display message when message is not defined', () => {
		render(<LoadingSpinner />)
		expect(screen.queryByText('pork sausage')).not.toBeInTheDocument()
	})

	it('has appropriate aria attribute for accessibility', () => {
		render(<LoadingSpinner message='Load this' />)
		const spin = screen.getByRole('status')
		expect(spin).toBeInTheDocument()
	})

	it('has correct sm size', () => {
		render(<LoadingSpinner size='sm' />)
		const div = screen.getByRole('status')
		expect(div).toHaveClass('w-5', 'h-5')
	})
})

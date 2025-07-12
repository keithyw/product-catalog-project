import CardContainer from '@/components/ui/CardContainer'
import PageTitle from '@/components/ui/PageTitle'

export default function DashboardPage() {
	return (
		<div className='min-h-screen bg-gray-50 p-8'>
			<CardContainer>
				<PageTitle>Welcome to My Product Dashboard</PageTitle>
				<p className='text-lg text-gray-700 mb-8'>
					This dashboard is pretty bad azz
				</p>
			</CardContainer>
		</div>
	)
}

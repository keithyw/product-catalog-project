'use client'

import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useParams, useRouter } from 'next/navigation'
import DetailsContainer from '@/components/ui/DetailsContainer'
import DetailSection, { DetailSectionRow } from '@/components/ui/DetailSection'
import Button from '@/components/ui/form/Button'
import ConfirmationModal from '@/components/ui/modals/ConfirmationModal'
import { PRODUCT_PERMISSIONS, PRICING_RULES_URL } from '@/lib/constants'
import priceRulesService from '@/lib/services/priceRules'
import { PriceRule } from '@/types/product'

const PriceRulesDetailsPage = () => {
	const router = useRouter()
	const params = useParams()
	const ruleId = params.id
	const [isLoading, setIsLoading] = useState(false)
	const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [rule, setRule] = useState<PriceRule | null>(null)
	const [details, setDetails] = useState<DetailSectionRow[]>([])

	useEffect(() => {
		if (!ruleId) return
		const fetchData = async () => {
			setIsLoading(true)
			try {
				const res = await priceRulesService.get(parseInt(ruleId as string))
				setRule(res)
				setDetails([
					{ label: 'Name', value: res.name },
					{ label: 'Description', value: res.description || '' },
					{ label: 'Rule Type', value: res.rule_type },
					{
						label: 'Rule Config',
						value: res.rule_config ? JSON.stringify(res.rule_config) : '',
					},
					{ label: 'Callback Function', value: res.callback_function || '' },
					{ label: 'Priority', value: res.priority.toString() },
					{ label: 'Is Active', value: res.is_active ? 'Yes' : 'No' },
				])
			} catch (e: unknown) {
				if (e instanceof Error) {
					setError(e.message)
					router.push(PRICING_RULES_URL)
				}
			} finally {
				setIsLoading(false)
			}
		}
		fetchData()
	}, [router, ruleId])

	const handleDelete = async () => {
		if (rule) {
			try {
				await priceRulesService.delete(rule.id)
				toast.success(`Price Rule ${rule.name} deleted successfully`)
				router.push(PRICING_RULES_URL)
			} catch (e: unknown) {
				console.error('Failed deleting price rule: ', e)
				toast.error(`Failed to delete price rule ${rule.name}`)
				setIsConfirmationModalOpen(false)
			}
		}
	}

	const buttons = (
		<>
			<Button
				actionType='edit'
				onClick={() => router.push(`${PRICING_RULES_URL}/${ruleId}/edit`)}
			>
				Edit
			</Button>
			<Button
				actionType='delete'
				onClick={() => setIsConfirmationModalOpen(true)}
			>
				Delete
			</Button>
		</>
	)

	const confirmationModal = (
		<>
			<ConfirmationModal
				isOpen={isConfirmationModalOpen}
				onClose={() => setIsConfirmationModalOpen(false)}
				onConfirm={handleDelete}
				title='Confirm Delete Price Rule'
				message='Are you sure you want to delete this price rule?'
			/>
		</>
	)

	return (
		<DetailsContainer
			title='Pricing Rule Details'
			permission={PRODUCT_PERMISSIONS.CHANGE}
			isLoading={isLoading}
			error={error}
			buttonsChildren={buttons}
			confirmationModel={confirmationModal}
		>
			{rule && <DetailSection rows={details} />}
		</DetailsContainer>
	)
}

export default PriceRulesDetailsPage

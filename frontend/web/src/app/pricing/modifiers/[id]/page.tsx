'use client'

import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useParams, useRouter } from 'next/navigation'
import DetailsContainer from '@/components/ui/DetailsContainer'
import DetailSection, { DetailSectionRow } from '@/components/ui/DetailSection'
import ViewDetailsTable from '@/components/ui/ViewDetailsTable'
import Button from '@/components/ui/form/Button'
import ConfirmationModal from '@/components/ui/modals/ConfirmationModal'
import {
	PRODUCT_PERMISSIONS,
	PRICING_MODIFIERS_URL,
	PRICING_RULES_URL,
} from '@/lib/constants'
import priceModifiersService from '@/lib/services/priceModifiers'
import priceRuleService from '@/lib/services/priceRules'
import { PriceModifier, PriceRule } from '@/types/product'
import { TableColumn } from '@/types/table'
import RuleModifiersDrawer from './RuleModifiersDrawer'

const COLS: TableColumn<PriceRule>[] = [
	{
		header: 'ID',
		accessor: 'id',
		sortable: true,
	},
	{
		header: 'Name',
		accessor: 'name',
		sortable: true,
	},
	{
		header: 'Type',
		accessor: 'rule_type',
		sortable: false,
	},
	{
		header: 'Rule Configuration',
		accessor: 'rule_config',
		render: (row) => {
			return <span>{JSON.stringify(row.rule_config)}</span>
		},
		sortable: false,
	},
]

const PricingModifiersDetailsPage = () => {
	const router = useRouter()
	const params = useParams()
	const modifierId = params.id
	const [isLoading, setIsLoading] = useState(false)
	const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)
	const [isModiferRulesDrawerOpen, setIsModiferRulesDrawerOpen] =
		useState(false)
	const [error, setError] = useState<string | null>(null)
	const [modifier, setModifier] = useState<PriceModifier | null>(null)
	const [details, setDetails] = useState<DetailSectionRow[]>([])
	const [priceRules, setPriceRules] = useState<PriceRule[]>([])

	const cols = useMemo(() => COLS, [])

	useEffect(() => {
		if (modifierId) {
			const fetchData = async () => {
				setIsLoading(true)
				try {
					const res = await priceModifiersService.get(
						parseInt(modifierId as string),
					)
					setModifier(res)
					setDetails([
						{ label: 'Name', value: res.name },
						{ label: 'Description', value: res.description || '' },
						{ label: 'Amount', value: res.amount.toString() },
						{ label: 'Type', value: res.type },
						{ label: 'Priority', value: res.priority.toString() },
						{ label: 'Category', value: res.category_name || '' },
						{
							label: 'Attribute Set',
							value: res.product_attribute_set_name || '',
						},
						{
							label: 'Attribute',
							value: res.product_attribute_name || '',
						},
						{
							label: 'Attribute Value',
							value: res.product_attribute_value || '',
						},
					])
					const priceRulesRes = await priceRuleService.fetch(1, 1000)
					setPriceRules(priceRulesRes.results)
				} catch (e: unknown) {
					if (e instanceof Error) {
						setError(e.message)
						router.push(PRICING_MODIFIERS_URL)
					}
				} finally {
					setIsLoading(false)
				}
			}
			fetchData()
		}
	}, [modifierId, router])

	const handleDelete = async () => {
		if (modifier) {
			try {
				await priceModifiersService.delete(modifier.id)
				toast.success(`Modifier ${modifier.name} deleted successfully`)
				router.push(PRICING_MODIFIERS_URL)
			} catch (e: unknown) {
				console.error('Failed deleting modifier: ', e)
				toast.error(`Failed to delete modifier ${modifier.name}`)
				setIsConfirmationModalOpen(false)
			}
		}
	}

	const onUpdate = (updatedModifier: PriceModifier) => {
		setModifier(updatedModifier)
	}

	const buttons = (
		<>
			<Button
				actionType='view'
				type='button'
				onClick={() => setIsModiferRulesDrawerOpen(true)}
			>
				Manage Modifier Rules
			</Button>
			<Button
				actionType='edit'
				onClick={() =>
					router.push(`${PRICING_MODIFIERS_URL}/${modifierId}/edit`)
				}
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
				title='Confirm Delete Modifier'
				message='Are you sure you want to delete this modifier?'
			/>
		</>
	)
	return (
		<DetailsContainer
			title='Pricing Modifier Details'
			permission={PRODUCT_PERMISSIONS.CHANGE}
			isLoading={isLoading}
			error={error}
			buttonsChildren={buttons}
			confirmationModal={confirmationModal}
		>
			{modifier && <DetailSection rows={details} />}
			<div className='mt-8'>
				<h2 className='text-xl font-semibold text-gray-900 mb-4 border-b pb-2'>
					Price Rules
				</h2>
				<ViewDetailsTable
					data={modifier?.price_rules_output || []}
					columns={cols}
					rowKey='id'
					getRowHref={(row) => `${PRICING_RULES_URL}/${row.id}`}
				/>
			</div>
			<RuleModifiersDrawer
				modifier={modifier as PriceModifier}
				priceRules={priceRules}
				removablePriceRules={modifier?.price_rules_output || []}
				isOpen={isModiferRulesDrawerOpen}
				onClose={() => setIsModiferRulesDrawerOpen(false)}
				onUpdate={onUpdate}
			/>
		</DetailsContainer>
	)
}

export default PricingModifiersDetailsPage

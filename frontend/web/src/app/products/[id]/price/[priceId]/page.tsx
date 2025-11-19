'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DetailsContainer from '@/components/ui/DetailsContainer'
import DetailSection, { DetailSectionRow } from '@/components/ui/DetailSection'
import ViewDetailsTable from '@/components/ui/ViewDetailsTable'
import Button from '@/components/ui/form/Button'
import {
	PRODUCT_PERMISSIONS,
	PRICE_URL,
	PRODUCTS_URL,
	PRICING_MODIFIERS_URL,
} from '@/lib/constants'
import priceModifiersService from '@/lib/services/priceModifiers'
import productService from '@/lib/services/product'
import { PriceModifier, Product } from '@/types/product'
import { TableColumn } from '@/types/table'
import PriceModifiersDrawer from './PriceModifiersDrawer'

const COLS: TableColumn<PriceModifier>[] = [
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
		header: 'Amount',
		accessor: 'amount',
		sortable: true,
	},
	{
		header: 'Type',
		accessor: 'type',
		sortable: true,
	},

	// 'name',
	//         'description',
	//         'amount',
	//         'category',
	//         'category_name',
	//         'price_rules',
	//         'price_rules_output',
	// 		'product_attribute',
	//         'product_attribute_value',
	//         'product_attribute_name',
	//         'product_attribute_set',
	//         'product_attribute_set_name',
	//         'type',
]

const PriceDetailsPage = () => {
	const params = useParams()
	const router = useRouter()
	const id = params.id
	const priceId = params.priceId
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [error, setError] = useState<string>('')
	const [product, setProduct] = useState<Product>()
	const [modifiers, setModifiers] = useState<PriceModifier[]>([])
	const [details, setDetails] = useState<DetailSectionRow[]>([])
	const [isModiferRulesDrawerOpen, setIsModiferRulesDrawerOpen] =
		useState(false)

	const cols = useMemo(() => COLS, [])

	useEffect(() => {
		if (!id) return
		const fetchData = async () => {
			setIsLoading(true)
			try {
				const res = await productService.get(parseInt(id as string))
				setProduct(res)
				setDetails([
					{
						label: 'Price',
						value: [
							(res.price?.currency_code as string) || '$',
							`${res.price?.price.toString()}`,
						].join(''),
					},
					{
						label: 'Price Source',
						value: res.price?.price_source as string,
					},
					{
						label: 'Is Active?',
						value: res.price?.is_active ? 'Yes' : 'No',
					},
				])
				const modRes = await priceModifiersService.fetch(1, 1000)
				setModifiers(modRes.results)
			} catch (e: unknown) {
				if (e instanceof Error) {
					console.error(e.message)
					setError(e.message)
				}
			} finally {
				setIsLoading(false)
			}
		}
		fetchData()
	}, [id])

	const onUpdate = (product: Product) => {
		setProduct(product)
	}

	const buttons = (
		<>
			<Button
				actionType='view'
				type='button'
				onClick={() => setIsModiferRulesDrawerOpen(true)}
			>
				Manage Price Modifiers
			</Button>
			<Button
				actionType='edit'
				onClick={() =>
					router.push(`${PRODUCTS_URL}/${id}/${PRICE_URL}/${priceId}/edit`)
				}
			>
				Edit
			</Button>
		</>
	)

	return (
		<DetailsContainer
			title={`Price Details for ${product?.name}`}
			permission={PRODUCT_PERMISSIONS.VIEW}
			isLoading={isLoading}
			error={error}
			buttonsChildren={buttons}
		>
			{product && <DetailSection rows={details} />}
			<div className='mt-8'>
				<h2 className='text-xl font-semibold text-gray-900 mb-4 border-b pb-2'>
					Price Modifiers
				</h2>
				<ViewDetailsTable
					data={product?.price?.price_modifiers_output || []}
					columns={cols}
					rowKey='id'
					getRowHref={(row) => `${PRICING_MODIFIERS_URL}/${row.id}`}
				/>
			</div>
			<PriceModifiersDrawer
				product={product as Product}
				modifiers={modifiers}
				removableModifiers={product?.price?.price_modifiers_output || []}
				isOpen={isModiferRulesDrawerOpen}
				onClose={() => setIsModiferRulesDrawerOpen(false)}
				onUpdate={onUpdate}
			/>
		</DetailsContainer>
	)
}

export default PriceDetailsPage

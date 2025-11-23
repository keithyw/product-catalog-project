import React, { useEffect, useState } from 'react'
import AutocompleteInput from '@/components/ui/form/AutocompleteInput'
import productService from '@/lib/services/product'
import useInventoryStore from '@/stores/useInventoryStore'
import { OptionType } from '@/types/form'
import { Product } from '@/types/product'
import { StepComponentProps } from '@/types/wizard'

const ChooseProductionStep = ({ setSubmitHandler }: StepComponentProps) => {
	const { setIsCurrentStepValid, setInventoryItem, product, setProduct } =
		useInventoryStore()
	const [products, setProducts] = useState<Product[]>([])

	useEffect(() => {
		if (product) {
			setIsCurrentStepValid(true)
		}
	}, [product, setIsCurrentStepValid])

	useEffect(() => {
		const handleStepSubmit = async (): Promise<boolean> => {
			if (!product) {
				return false
			}
			return true
		}
		setSubmitHandler(handleStepSubmit)
		return () => {
			setSubmitHandler(null)
		}
	}, [product, setSubmitHandler])

	const handleSearch = async (query: string): Promise<OptionType[]> => {
		try {
			const res = await productService.fetch(1, 20, query)
			if (res.count > 0) {
				setProducts(res.results)
				return res.results.map((p) => ({ value: p.id, label: p.name }))
			}
		} catch (e: unknown) {
			console.error(e)
		}
		return []
	}

	const handleSelect = (productId: number) => {
		const product = products.find((p) => parseInt(p.id) === productId)
		setProduct(product as Product)
		setInventoryItem({
			product: productId,
			product_name: product?.name,
		})
		setIsCurrentStepValid(true)
	}

	return (
		<div className='space-y-4'>
			<AutocompleteInput
				id='product'
				label='Start typing to find a product'
				onSearch={handleSearch}
				onSelect={(v) => handleSelect(v as number)}
			/>
		</div>
	)
}

export default ChooseProductionStep

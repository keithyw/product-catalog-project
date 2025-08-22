'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { isArray } from 'lodash'
import Chip from '@/components/ui/Chip'
import Button from '@/components/ui/form/Button'
import brandService from '@/lib/services/brand'
import productService from '@/lib/services/product'
import useAIToolsStore from '@/stores/useAIToolsStore'
import { Brand, CreateBrandRequest } from '@/types/brand'
import { CreateProductRequest, SimpleProduct } from '@/types/product'
import { StepComponentProps } from '@/types/wizard'
import EditProductModal from '@/app/products/ai-tools/steps/EditProductModal'
import ProductReviewCard from '@/app/products/ai-tools/steps/ProductReviewCard'

const ProductReviewStep = ({ setSubmitHandler }: StepComponentProps) => {
	const [isEditModalOpen, setIsEditModalOpen] = useState(false)
	const [brands, setBrands] = useState<Brand[]>([])
	const [newBrands, setNewBrands] = useState<string[]>([])
	const [isSavingNewBrands, setIsSavingNewBrands] = useState(false)
	const [ignoreNewBrands, setIgnoreNewBrands] = useState(false)
	// this will be for the edit modal
	const [editProduct, setEditProduct] = useState<SimpleProduct | null>(null)
	const {
		productAttributeSet,
		setIsCurrentStepValid,
		setIsSubmitting,
		setProducts,
	} = useAIToolsStore()
	const products = useAIToolsStore((state) => state.products)

	const handleStepSubmit = useCallback(async (): Promise<boolean> => {
		setIsSubmitting(true)
		if (isArray(products) && products.length > 0) {
			try {
				const req: CreateProductRequest[] = products.map((p) => {
					return {
						name: p.name,
						brand:
							(brands.length > 0 &&
								brands.find((b) => b.name === p.brand)?.id) ||
							null,
						attribute_set: productAttributeSet?.id as number,
						attributes_data: p.attributes,
						is_active: false,
					}
				})
				const res = await productService.bulk(req)
				if (res) {
					console.log(res)
				}
			} catch (e: unknown) {
				console.error(e)
				return false
			} finally {
				setIsSubmitting(false)
			}
		}
		return true
	}, [brands, productAttributeSet, products, setIsSubmitting])

	useEffect(() => {
		const fetchBrands = async () => {
			try {
				const res = await brandService.fetch(1, 200)
				setBrands(res.results)
			} catch (e: unknown) {
				console.error(e)
			}
		}
		fetchBrands()
	}, [])

	useEffect(() => {
		setSubmitHandler(handleStepSubmit)
		return () => {
			setSubmitHandler(null)
		}
	}, [handleStepSubmit, setSubmitHandler])

	// find new brands that may have been generated
	useEffect(() => {
		const brandNames = brands.map((b) => b.name.toLowerCase())
		const hasNewBrands =
			products
				.filter((p) => !brandNames.includes(p.brand.toLowerCase()))
				.map((p) => p.brand) || []
		setNewBrands(hasNewBrands)
		setIsCurrentStepValid(hasNewBrands.length === 0 && ignoreNewBrands)
	}, [brands, ignoreNewBrands, products, setIsCurrentStepValid])

	const onEditProduct = (p: SimpleProduct) => {
		setEditProduct(p)
		setIsEditModalOpen(true)
	}

	const onRemoveProduct = (p: SimpleProduct) => {
		const updatedProducts = products.filter((item) => item.id !== p.id)
		setProducts(updatedProducts)
	}

	const onSaveNewBrands = async () => {
		setIsSavingNewBrands(true)
		try {
			const req: CreateBrandRequest[] = newBrands.map((b) => {
				return { name: b }
			})
			const res = await brandService.bulk(req)
			if (res.length > 0) {
				setBrands(brands.concat(res))
				setNewBrands([])
				setIgnoreNewBrands(true)
			}
		} catch (e: unknown) {
			console.error(e)
		} finally {
			setIsSavingNewBrands(false)
		}
	}

	const handleUpdateProduct = (updatedProduct: SimpleProduct) => {
		const updatedProducts = products.map((p) =>
			p.id === updatedProduct.id ? updatedProduct : p,
		)
		setProducts(updatedProducts)
	}

	return (
		<div className='mx-auto p-6 rounded-lg shadow-md'>
			{newBrands.length > 0 && !ignoreNewBrands && (
				<div className='w-full bg-white rounded-xl shadow-md p-6 mb-4'>
					<p className='text-red-500'>
						Warning! New Brands Detected. You must create them here or choose to
						ignore them, which means your generated products will not have
						brands associated initially.
					</p>
					<div className='flex flex-wrap gap-2 p-2 mt-2'>
						{newBrands.map((b, bidx) => (
							<Chip key={bidx} chipType='primary'>
								{b}
							</Chip>
						))}
					</div>
					<div className='flex justify-end space-x-2 mt-2'>
						<Button
							actionType='neutral'
							disabled={isSavingNewBrands}
							onClick={onSaveNewBrands}
						>
							Save New Brands
						</Button>
						<Button
							actionType='danger'
							disabled={isSavingNewBrands}
							onClick={() => setIgnoreNewBrands(true)}
						>
							Skip & Ignore
						</Button>
					</div>
				</div>
			)}
			<p className='text-gray-900'>
				Click on your product names to review and modify
			</p>
			<div className='mt-4'>
				<div className='relative mt-1'>
					<div className='relative w-full cursor-default'>
						<div className='flex flex-wrap gap-2 p-2'>
							{products && products.length > 0 ? (
								products.map((p) => (
									<ProductReviewCard
										key={p.id}
										product={p}
										onEdit={onEditProduct}
										onRemove={onRemoveProduct}
									/>
								))
							) : (
								<p>No products</p>
							)}
						</div>
					</div>
				</div>
			</div>
			<EditProductModal
				product={editProduct as SimpleProduct}
				brands={brands}
				isOpen={isEditModalOpen}
				onClose={() => setIsEditModalOpen(false)}
				onUpdateProduct={handleUpdateProduct}
			/>
		</div>
	)
}

export default ProductReviewStep

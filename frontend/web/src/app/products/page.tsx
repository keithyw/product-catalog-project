'use client'

import React, { useEffect } from 'react'
import DataTable from '@/components/ui/DataTable'
import SpinnerSection from '@/components/ui/SpinnerSection'
import productService from '@/lib/services/product'
import useProductStore from '@/stores/useProductStore'
import { Product } from '@/types/product'
import { TableColumn, TableRowAction } from '@/types/table'

export default function Page() {
	const [isLoading, setIsLoading] = React.useState(true)
	const [searchTerm, setSearchTerm] = React.useState('')
	const setProducts = useProductStore((state) => state.setProducts)
	const products = useProductStore((state) => state.products)

	const productColumns: TableColumn<Product>[] = [
		{
			header: 'ID',
			accessor: 'id',
		},
		{
			header: 'Name',
			accessor: 'name',
		},
	]

	const productActions: TableRowAction<Product>[] = [
		{
			label: 'Edit',
			onClick: (product) => {
				console.log('Editing ', product.id)
			},
			className: 'bg-blue-500 hover:bg-blue-600',
		},
		{
			label: 'Delete',
			onClick: (product) => {
				console.log('Deleting ', product.id)
			},
			className: 'bg-red-500 hover:bg-red-600',
		},
	]

	const fetchProducts = () => {
		setIsLoading(true)
		const loadProducts = async () => {
			try {
				const prods = await productService.getProducts()
				console.log('Fetched products:', prods)
				if (prods) {
					setProducts(prods.results || [])
				}
			} catch (e: unknown) {
				if (e instanceof Error) {
					console.error(e.message)
				}
			} finally {
				setIsLoading(false)
			}
		}
		loadProducts()
	}
	useEffect(() => {
		fetchProducts()
	}, [])

	const handleSearch = (term: string) => {
		setSearchTerm(term)
		console.log('Searching for:', term)
	}

	if (isLoading) {
		return <SpinnerSection spinnerMessage='Loading products...' />
	}

	return (
		<div>
			<h1>Products</h1>
			<DataTable
				data={products}
				columns={productColumns}
				rowKey='id'
				actions={productActions}
				searchTerm={searchTerm}
				onSearch={handleSearch}
			/>
		</div>
	)
}

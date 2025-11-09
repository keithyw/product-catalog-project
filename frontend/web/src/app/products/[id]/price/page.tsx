'use client'

import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { useParams, useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import CreateFormLayout from '@/components/layout/CreateFormLayout'
import SpinnerSection from '@/components/ui/SpinnerSection'
import FormInput from '@/components/ui/form/FormInput'
import { FAILED_LOADING_PRODUCT_ERROR, PRODUCTS_URL } from '@/lib/constants'
import priceService from '@/lib/services/price'
import productService from '@/lib/services/product'
import { handleFormErrors } from '@/lib/utils/errorHandler'
import { priceCreateSchema, PriceCreateFormData } from '@/schemas/priceSchema'
import useProductStore from '@/stores/useProductStore'
import { FormField } from '@/types/form'
import { CreatePriceRequest } from '@/types/product'

const formFields: FormField<PriceCreateFormData>[] = [
	{
		name: 'price',
		label: 'Price',
		placeholder: 'Enter price',
		required: true,
	},
]

const PricePage = () => {
	const router = useRouter()
	const params = useParams()
	const id = params.id
	const [isLoading, setIsLoading] = useState(false)
	const { product, setProduct } = useProductStore()
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<PriceCreateFormData>({
		resolver: zodResolver(priceCreateSchema),
		defaultValues: {
			price: '',
		},
	})

	useEffect(() => {
		if (id) {
			setIsLoading(true)
			const fetchData = async () => {
				try {
					const res = await productService.get(parseInt(id as string))
					setProduct(res)
					if (res.price) {
						reset({
							price: res.price.price.toString(),
						})
					}
				} catch (e: unknown) {
					if (e instanceof Error) {
						console.error('Failed loading product: ', e)
						setError('root.serverError', {
							type: 'server',
							message: FAILED_LOADING_PRODUCT_ERROR,
						})
						toast.error(FAILED_LOADING_PRODUCT_ERROR)
						router.push(PRODUCTS_URL)
					}
				} finally {
					setIsLoading(false)
				}
			}
			fetchData()
		}
	}, [id, reset, router, setError, setProduct])

	const onSubmit = async (data: PriceCreateFormData) => {
		try {
			const priceData: CreatePriceRequest = {
				price: parseFloat(data.price),
				currency_code: 'USD',
				region_code: 'USA',
				price_source: 'manual',
				product: parseInt(product?.id as string),
			}
			const res = product?.price
				? await priceService.patch(product?.price.id, {
						price: parseFloat(data.price),
					})
				: await priceService.create(priceData)
			toast.success(
				`Price "${res.price}" for ${product?.name} saved successfully!`,
			)
		} catch (e: unknown) {
			handleFormErrors<PriceCreateFormData>(
				e,
				setError,
				'Failed to create price. Please review your input.',
			)
		}
	}

	if (isLoading) {
		return <SpinnerSection spinnerMessage='Loading price...' />
	}

	if (!product) {
		return <div>No product found</div>
	}

	return (
		<CreateFormLayout
			title={`Manage Price for ${product.name} #${product.id}`}
			isSubmitting={isSubmitting}
			submitText='Modify Price'
			submittingText='Saving...'
			handleSubmit={handleSubmit(onSubmit)}
		>
			{formFields.map((f, idx) => (
				<FormInput
					key={idx}
					field={f}
					register={register}
					errorMessage={errors[f.name]?.message as string}
				/>
			))}
		</CreateFormLayout>
	)
}

export default PricePage

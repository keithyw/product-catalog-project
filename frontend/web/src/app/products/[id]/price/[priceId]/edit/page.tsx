'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useParams, useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import CreateFormLayout from '@/components/layout/CreateFormLayout'
import SpinnerSection from '@/components/ui/SpinnerSection'
import FormInput from '@/components/ui/form/FormInput'
import {
	FAILED_LOADING_PRODUCT_ERROR,
	PRICE_URL,
	PRODUCTS_URL,
} from '@/lib/constants'
import priceService from '@/lib/services/price'
import productService from '@/lib/services/product'
import { handleFormErrors } from '@/lib/utils/errorHandler'
import { priceCreateSchema, PriceCreateFormData } from '@/schemas/priceSchema'
import { FormField } from '@/types/form'
import { CreatePriceRequest, Product } from '@/types/product'

const formFields: FormField<PriceCreateFormData>[] = [
	{
		name: 'price',
		label: 'Price',
		placeholder: 'Enter price',
		required: true,
	},
]

const EditPricePage = () => {
	const router = useRouter()
	const params = useParams()
	const priceId = params.priceId
	const [isLoading, setIsLoading] = useState(false)
	const [product, setProduct] = useState<Product | null>(null)

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
		if (!priceId) return
		const fetchData = async () => {
			setIsLoading(true)
			try {
				const product = await productService.get(parseInt(params.id as string))
				setProduct(product)
				if (product.price) {
					reset({
						price: product.price.price.toString(),
					})
				}
			} catch (e: unknown) {
				if (e instanceof Error) {
					console.error(e.message)
					toast.error(FAILED_LOADING_PRODUCT_ERROR)
					router.push(PRODUCTS_URL)
				}
			} finally {
				setIsLoading(false)
			}
		}
		fetchData()
	}, [params, priceId, reset, router])

	const onSubmit = async (data: PriceCreateFormData) => {
		try {
			const priceData: CreatePriceRequest = {
				price: parseFloat(data.price),
				currency_code: 'USD',
				region_code: 'USA',
				price_source: 'manual',
				product: parseInt(product?.id as string),
			}
			const res = await priceService.patch(
				parseInt(priceId as string),
				priceData,
			)
			toast.success(
				`Price "${res.price}" for ${product?.name} saved successfully!`,
			)
			router.push(`${PRODUCTS_URL}/${product?.id}/${PRICE_URL}/${res.id}`)
		} catch (e: unknown) {
			handleFormErrors<PriceCreateFormData>(
				e,
				setError,
				'Failed to create price. Please review your input.',
			)
		}
	}

	if (isLoading) {
		return <SpinnerSection spinnerMessage='loading...' />
	}

	return (
		<CreateFormLayout
			title={`Edit Price for ${product?.name as string}`}
			isSubmitting={isSubmitting}
			submitText='Update Price'
			submittingText='Updating...'
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

export default EditPricePage

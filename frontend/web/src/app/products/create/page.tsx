'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import PermissionGuard from '@/components/auth/PermissionGuard'
import WizardLayout from '@/components/layout/WizardLayout'
import { PRODUCTS_URL } from '@/lib/constants'
import { PERMISSION_PERMISSIONS } from '@/lib/constants/permissions'
import {
	// productCreateSchem,
	ProductCreateFormData,
} from '@/schemas/productSchema'
import productService from '@/lib/services/product'
import { handleFormErrors } from '@/lib/utils/errorHandler'
import useProductStore from '@/stores/useProductStore'
import { CreateProductRequest, Product } from '@/types/product'
import AttributeSetStep from '@/app/products/create/steps/AttributeSetStep'
import ProductInfo from '@/app/products/create/steps/ProductInfoStep'

const wizardSteps = [
	{ id: 'product', title: 'Product Info', component: ProductInfo },
	{ id: 'attribute_set', title: 'Attribute Set', component: AttributeSetStep },
]

export default function CreateProductPage() {
	const router = useRouter()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const { product, setProduct, currentStep, setCurrentStep, clearDraft } =
		useProductStore()

	const methods = useForm<ProductCreateFormData>({
		defaultValues: product || {
			name: '',
			description: '',
			brand: null,
			category: null,
			attribute_set: null,
			is_active: false,
		},
		mode: 'onTouched',
	})

	const {
		handleSubmit,
		formState: { isValid },
		// getValues,
		reset,
	} = methods

	useEffect(() => {
		if (product) {
			reset(product as ProductCreateFormData)
		}
	}, [product, reset])

	const handleNext = handleSubmit(async (data: ProductCreateFormData) => {
		setIsSubmitting(true)
		const currentStepIndex = wizardSteps.findIndex(
			(step) => step.id === wizardSteps[currentStep - 1].id,
		)
		const nextStepIndex = currentStepIndex + 1

		try {
			let updatedProduct: Product | null = null
			if (currentStep === 1 && !product?.id) {
				const d: CreateProductRequest = {
					name: data.name!,
					description: data.description,
					brand: data.brand,
					category: data.category,
					attribute_set: data.attribute_set,
					// attributes_data: data.attributes_data || null,
					is_active: false,
				}
				updatedProduct = await productService.create(d)
				toast.success(`Product ${updatedProduct.name} created successfully!`)
			} else {
				if (!product) {
					throw new Error('Product not found')
				}
				const patchData: Partial<CreateProductRequest> = {}
				if (currentStep === 1) {
					patchData.name = data.name
					patchData.description = data.description
					patchData.brand = data.brand
					patchData.category = data.category
					patchData.attribute_set = data.attribute_set
				} else if (currentStep === 2) {
					patchData.attributes_data = data.attributes_data
				}

				updatedProduct = await productService.patch(
					parseInt(product.id as string),
					patchData,
				)
				toast.success(`Product ${updatedProduct.name} updated successfully!`)
			}

			if (updatedProduct) {
				setProduct(updatedProduct)
			}

			if (nextStepIndex < wizardSteps.length) {
				setCurrentStep(nextStepIndex + 1)
			} else {
				toast.success('Product creation draft saved')
				router.push(`${PRODUCTS_URL}`)
				clearDraft()
			}
		} catch (e: unknown) {
			handleFormErrors<ProductCreateFormData>(
				e,
				methods.setError,
				'Failed to create product. Please review your input.',
			)
		} finally {
			setIsSubmitting(false)
		}
	})

	const handlePrevious = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1)
		}
	}

	const handleCancel = () => {
		clearDraft()
		router.push(PRODUCTS_URL)
	}

	const canGoNext = isValid

	console.log('is valid', isValid)

	const currentStepId = wizardSteps[currentStep - 1].id

	const stepsForLayout = useMemo(() => {
		return wizardSteps.map((step, idx) => ({
			...step,
			isCompleted: idx < currentStep - 1,
		}))
	}, [currentStep])

	return (
		<PermissionGuard requiredPermission={PERMISSION_PERMISSIONS.ADD}>
			<FormProvider {...methods}>
				<WizardLayout
					title='Create New Product'
					steps={stepsForLayout}
					currentStepId={currentStepId}
					onNext={handleNext}
					onPrevious={handlePrevious}
					onCancel={handleCancel}
					isSubmitting={isSubmitting}
					canGoNext={canGoNext}
					canGoPrevious={currentStep > 1}
				/>
			</FormProvider>
		</PermissionGuard>
	)
}

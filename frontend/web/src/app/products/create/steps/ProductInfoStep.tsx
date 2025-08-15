'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import ComboboxSingleSelect from '@/components/ui/form/ComboboxSingleSelect'
import FormInput from '@/components/ui/form/FormInput'
import brandService from '@/lib/services/brand'
import categoryService from '@/lib/services/category'
import productAttributeSetService from '@/lib/services/productAttributeSet'
import productService from '@/lib/services/product'
import { handleFormErrors } from '@/lib/utils/errorHandler'
import {
	productCreateSchema,
	ProductCreateFormData,
} from '@/schemas/productSchema'
import useProductStore from '@/stores/useProductStore'
import { FormField, OptionType } from '@/types/form'
import { CreateProductRequest, ProductAttributeSet } from '@/types/product'
import { StepComponentProps } from '@/types/wizard'

const fields: FormField<ProductCreateFormData>[] = [
	{
		name: 'name',
		label: 'Product Name',
		placeholder: 'Enter product name',
		required: true,
	},
	{
		name: 'description',
		label: 'Description',
		placeholder: 'Enter description',
		required: false,
		type: 'textarea',
	},
	{ name: 'is_active', label: 'Is Active', required: true, type: 'checkbox' },
]

const ProductInfo: React.FC<StepComponentProps> = ({ setSubmitHandler }) => {
	const [brands, setBrands] = useState<OptionType[]>([])
	const [categories, setCategories] = useState<OptionType[]>([])
	const [, setAttributeSets] = useState<OptionType[]>([])
	const [productAttributeSets, setProductAttributeSets] = useState<
		ProductAttributeSet[]
	>([])
	const [loadingBrands, setLoadingBrands] = useState(true)
	const [loadingCategories, setLoadingCategories] = useState(true)
	const [loadingAttributeSets, setLoadingAttributeSets] = useState(true)
	const [errorBrands, setErrorBrands] = useState<string | null>(null)
	const [errorCategories, setErrorCategories] = useState<string | null>(null)
	const [errorAttributeSets, setErrorAttributeSets] = useState<string | null>(
		null,
	)

	const { product, setIsCurrentStepValid, setIsSubmitting, setProduct } =
		useProductStore()

	const {
		register,
		control,
		setError,
		formState: { errors, isValid, isSubmitting },
		watch,
		getValues,
		setValue,
		trigger,
	} = useForm<ProductCreateFormData>({
		resolver: zodResolver(productCreateSchema),
		defaultValues: {
			name: product ? product.name : '',
			description: product ? product.description : null,
			attribute_set: product ? product.attribute_set : null,
			brand: product ? product.brand : null,
			category: product ? product.category : null,
			is_active: product ? product.is_active : false,
		},
		mode: 'onChange',
	})

	const watchedBrand = watch('brand')
	const watchedCategory = watch('category')

	useEffect(() => {
		setIsCurrentStepValid(isValid)
		setIsSubmitting(isSubmitting)
	}, [isSubmitting, isValid, setIsCurrentStepValid, setIsSubmitting])

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoadingBrands(true)
				const brands = await brandService.fetch(1, 200)
				if (brands.count > 0) {
					setBrands(brands.results.map((b) => ({ value: b.id, label: b.name })))
				}
			} catch (e: unknown) {
				if (e instanceof Error) {
					setErrorBrands(e.message)
					console.error(e.message)
				}
			} finally {
				setLoadingBrands(false)
			}

			try {
				setLoadingCategories(true)
				const categories = await categoryService.fetch(1, 200)
				if (categories.count > 0) {
					setCategories(
						categories.results.map((c) => ({ value: c.id, label: c.name })),
					)
				}
			} catch (e: unknown) {
				if (e instanceof Error) {
					setErrorCategories(e.message)
					console.error(e.message)
				}
			} finally {
				setLoadingCategories(false)
			}

			try {
				setLoadingAttributeSets(true)
				const attributeSets = await productAttributeSetService.fetch(1, 200)
				if (attributeSets.count > 0) {
					setAttributeSets(
						attributeSets.results.map((as) => ({
							value: as.id,
							label: as.name,
						})),
					)
					setProductAttributeSets(attributeSets.results)
				}
			} catch (e: unknown) {
				if (e instanceof Error) {
					setErrorAttributeSets(e.message)
					console.error(e.message)
				}
			} finally {
				setLoadingAttributeSets(false)
			}
		}
		fetchData()
	}, [])

	const filteredAttributeSets = useMemo(() => {
		let filtered = productAttributeSets

		if (watchedBrand) {
			filtered = filtered.filter(
				(set) => set.brand === watchedBrand || set.brand === null,
			)
		}

		if (watchedCategory) {
			filtered = filtered.filter(
				(set) => set.category === watchedCategory || set.category === null,
			)
		}
		return filtered.map((set) => ({ value: set.id, label: set.name }))
	}, [productAttributeSets, watchedBrand, watchedCategory])

	useEffect(() => {
		const currentAttributeSetId = watch('attribute_set')
		if (
			!loadingAttributeSets &&
			currentAttributeSetId !== null &&
			currentAttributeSetId !== undefined &&
			filteredAttributeSets.length > 0 &&
			!filteredAttributeSets.some((set) => set.value === currentAttributeSetId)
		) {
			setValue('attribute_set', null, { shouldValidate: true })
		}
	}, [filteredAttributeSets, loadingAttributeSets, watch, setValue])

	useEffect(() => {
		const handleStepSubmit = async (): Promise<boolean> => {
			const isFormValid = await trigger()
			setIsSubmitting(true)
			if (isFormValid) {
				const data = getValues()
				try {
					const req: CreateProductRequest = {
						name: data.name!,
						description: data.description || null,
						brand: data.brand,
						category: data.category,
						attribute_set: data.attribute_set,
						is_active: data.is_active,
					}

					const updatedProduct = product
						? await productService.patch(parseInt(product.id), req)
						: await productService.create(req)
					setProduct(updatedProduct)
					toast.success(`Product ${updatedProduct.name} saved successfully!`)
				} catch (e: unknown) {
					handleFormErrors<ProductCreateFormData>(
						e,
						setError,
						'Failed to create product. Please review your input.',
					)
				} finally {
					setIsSubmitting(false)
					return true
				}
			} else {
				setIsSubmitting(false)
				return false
			}
		}
		setSubmitHandler(handleStepSubmit)
		return () => {
			setSubmitHandler(null)
		}
	}, [
		product,
		getValues,
		setProduct,
		setError,
		setIsSubmitting,
		setSubmitHandler,
		trigger,
	])

	return (
		<div className='space-y-4'>
			{fields.map((f, idx) => (
				<FormInput
					key={idx}
					field={f}
					register={register}
					control={control}
					errorMessage={
						errors[f.name as keyof ProductCreateFormData]?.message as string
					}
				/>
			))}
			<Controller
				name='brand'
				control={control}
				render={({ field }) => (
					<ComboboxSingleSelect
						id='brand'
						label='Brand'
						options={brands}
						selectedValue={field.value || null}
						onSelect={field.onChange}
						placeholder={
							loadingBrands
								? 'Loading brands...'
								: errorBrands || 'Select a brand'
						}
						readOnly={loadingBrands || !!errorBrands}
						errorMessage={errors.brand?.message as string}
					/>
				)}
			/>
			<Controller
				name='category'
				control={control}
				render={({ field }) => (
					<ComboboxSingleSelect
						id='category'
						label='Category'
						options={categories}
						selectedValue={field.value || null}
						onSelect={field.onChange}
						placeholder={
							loadingCategories
								? 'Loading categories...'
								: errorCategories || 'Select a category'
						}
						readOnly={loadingCategories || !!errorCategories}
						errorMessage={errors.category?.message as string}
					/>
				)}
			/>
			<Controller
				name='attribute_set'
				control={control}
				render={({ field }) => (
					<ComboboxSingleSelect
						id='attribute_set'
						label='Attribute Set'
						options={filteredAttributeSets}
						selectedValue={field.value || null}
						onSelect={field.onChange}
						placeholder={
							loadingAttributeSets
								? 'Loading attribute sets...'
								: errorAttributeSets || 'Select an attribute set'
						}
						readOnly={loadingAttributeSets || !!errorAttributeSets}
						errorMessage={errors.attribute_set?.message as string}
					/>
				)}
			/>
		</div>
	)
}

export default ProductInfo

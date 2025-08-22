import React, { useCallback, useEffect, useState } from 'react'
import { DialogTitle } from '@headlessui/react'
// import { isArray } from 'lodash'
import Button from '@/components/ui/form/Button'
import CheckboxInput from '@/components/ui/form/CheckboxInput'
import ComboboxMultiSelect from '@/components/ui/form/ComboboxMultiSelect'
import SelectDropdown from '@/components/ui/form/SelectDropdown'
import TextInput from '@/components/ui/form/TextInput'
import BaseModal from '@/components/ui/modals/BaseModal'
import useAIToolsStore from '@/stores/useAIToolsStore'
import { Brand } from '@/types/brand'
import { OptionType } from '@/types/form'
import { ProductAttribute, SimpleProduct } from '@/types/product'

interface EditProductModalProps {
	product: SimpleProduct
	brands: Brand[]
	isOpen: boolean
	onClose: () => void
	onUpdateProduct: (product: SimpleProduct) => void
}

const EditProductModal = ({
	product,
	brands,
	isOpen,
	onClose,
	onUpdateProduct,
}: EditProductModalProps) => {
	const [localAttributes, setLocalAttributes] = useState<
		Record<string, string>
	>({})
	const [localProductAttributes, setProductLocalAttributes] = useState<
		ProductAttribute[]
	>([])
	const [localBrand, setLocalBrand] = useState<Brand | null>(null)
	const [localProduct, setLocalProduct] = useState<SimpleProduct | null>(null)
	const [brandOptions, setBrandOptions] = useState<OptionType[]>([])
	const { productAttributeSet } = useAIToolsStore()

	useEffect(() => {
		if (product) {
			setLocalProduct(product)
			if (product.brand) {
				setLocalBrand(brands.find((b) => b.name === product.brand) as Brand)
			}
			const myLocalAttributes = product.attributes
			Object.keys(product.attributes).forEach((k) => {
				myLocalAttributes[k] =
					typeof product.attributes[k] === 'object'
						? JSON.stringify(product.attributes[k])
						: product.attributes[k]
			})
			setLocalAttributes(myLocalAttributes)
			setProductLocalAttributes(
				Object.keys(product.attributes).map(
					(a) =>
						productAttributeSet?.attributes_detail.find(
							(d) => d.name === a,
						) as ProductAttribute,
				) || [],
			)
		}
	}, [brands, product, productAttributeSet])

	useEffect(() => {
		setBrandOptions(
			productAttributeSet?.product_type_brands &&
				productAttributeSet.product_type_brands.length > 0
				? brands
						.filter((b) =>
							productAttributeSet.product_type_brands?.includes(b.id),
						)
						.map((o) => {
							return { value: o.id, label: o.name }
						})
				: brands.map((o) => {
						return { value: o.id, label: o.name }
					}),
		)
	}, [brands, productAttributeSet])

	const handleCancel = () => {
		onClose()
	}

	const updateBrand = (id: number) => {
		setLocalBrand(brands.find((b) => b.id === id) as Brand)
		setLocalProduct({
			...(localProduct as SimpleProduct),
			brand: (brands.find((b) => b.id === id) as Brand).name,
		})
	}

	const updateValue = useCallback(
		(key: string, v: string) => {
			setLocalProduct({ ...(localProduct as SimpleProduct), [key]: v })
		},
		[localProduct],
	)

	const updateAttribute = useCallback(
		(key: string, v: string) => {
			setLocalAttributes({ ...localAttributes, [key]: v })
			const val =
				(
					productAttributeSet?.attributes_detail.find(
						(d) => d.name === key,
					) as ProductAttribute
				).type === 'multiselect'
					? JSON.parse(v)
					: v
			setLocalProduct({
				...(localProduct as SimpleProduct),
				attributes: { ...localAttributes, [key]: val },
			})
		},
		[localAttributes, localProduct, productAttributeSet, setLocalAttributes],
	)

	const handleUpdateProduct = useCallback(() => {
		onUpdateProduct(localProduct as SimpleProduct)
		onClose()
	}, [localProduct, onClose, onUpdateProduct])

	return (
		<BaseModal isOpen={isOpen} onClose={onClose}>
			{product ? (
				<div className='mt-4 space-y-4'>
					<DialogTitle
						as='h2'
						className='text-lg font-medium font-semibold leading-6 text-gray-900'
					>
						Edit Product {product.name}
					</DialogTitle>
					<div className='overflow-y-auto'>
						<div className='p-2'>
							<TextInput
								id='name'
								label='Name'
								value={(localProduct?.name as string) || ''}
								onChange={(e) => updateValue('name', e.target.value)}
							/>
						</div>
						<div className='p-2'>
							<SelectDropdown
								label='Brand'
								options={brandOptions}
								selectedValue={localBrand?.id as number}
								onSelect={(v) => updateBrand(v as number)}
							/>
						</div>
						<div className='p-2 text-gray-900'>
							{localProductAttributes.length > 0 &&
								localProductAttributes.map((a, aidx) => (
									<div key={aidx} className='py-2'>
										{['text', 'number'].includes(a.type) && (
											<TextInput
												id={a.id as string}
												label={a.display_name || a.name}
												type={a.type}
												value={localAttributes[a.name]}
												onChange={(e) => {
													updateAttribute(a.name, e.target.value)
												}}
											/>
										)}
										{a.type === 'boolean' && (
											<CheckboxInput
												id={a.id as string}
												label={a.display_name || a.name}
												checked={
													String(localAttributes[a.name]).toLowerCase() ===
													'true'
												}
												onChange={(e) =>
													updateAttribute(
														a.name,
														e.target.checked ? 'true' : 'false',
													)
												}
											/>
										)}
										{['select'].includes(a.type) && (
											<SelectDropdown
												label={a.display_name || a.name}
												options={a.options as OptionType[]}
												selectedValue={localAttributes[a.name]}
												onSelect={(v) => updateAttribute(a.name, v as string)}
											/>
										)}
										{a.type === 'multiselect' && (
											<ComboboxMultiSelect
												id={a.id as string}
												label={a.display_name || a.name}
												options={a.options as OptionType[]}
												selectedValues={JSON.parse(
													localAttributes[a.name] as string,
												)}
												onSelect={(v) =>
													updateAttribute(a.name, JSON.stringify(v))
												}
											/>
										)}
									</div>
								))}
						</div>
						<div className='flex justify-end space-x-2'>
							<Button actionType='neutral' onClick={handleCancel}>
								Cancel
							</Button>
							<Button actionType='edit' onClick={handleUpdateProduct}>
								Update
							</Button>
						</div>
					</div>
				</div>
			) : null}
		</BaseModal>
	)
}

export default EditProductModal

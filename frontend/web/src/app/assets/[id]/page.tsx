'use client'

import React, { useCallback, useState } from 'react'
import { useParams } from 'next/navigation'
import DetailsLayout from '@/components/layout/DetailsLayout'
import { DetailSectionRow } from '@/components/ui/DetailSection'
import {
	ASSETS_URL,
	FAILED_LOADING_ASSETS_ERROR,
	PRODUCT_PERMISSIONS,
} from '@/lib/constants'
import { useDetailsController } from '@/lib/hooks/useDetailsController'
import assetService from '@/lib/services/assets'
import { Asset } from '@/types/asset'

const AssetDetailsPage = () => {
	const params = useParams()
	const [details, setDetails] = useState<DetailSectionRow[]>([])

	const detailsCallback = useCallback((res: Asset) => {
		setDetails([
			{
				label: 'URL',
				value: res.url,
				isAsset: true,
				type: res.type,
			},
			{ label: 'Name', value: res.name || '' },
			{ label: 'Type', value: res.type },
			{ label: 'Filepath', value: res.filepath || '' },
			{ label: 'Extension', value: res.extension || '' },
			{ label: 'Dimensions', value: res.dimensions || '' },
			{ label: 'Description', value: (res.description as string) || '' },
		])
	}, [])

	const {
		data: asset,
		isLoading,
		error,
		handleDeleteConfirm,
		handleEditClick,
		isConfirmationModalOpen,
		setIsConfirmationModalOpen,
	} = useDetailsController({
		id: parseInt(params.id as string),
		deleteData: assetService.delete,
		getData: assetService.get,
		redirectUrl: ASSETS_URL,
		errorLoadingMessage: FAILED_LOADING_ASSETS_ERROR,
		handleDetailsCallback: detailsCallback,
	})

	return (
		<DetailsLayout
			title='Asset Details'
			item={asset as Asset}
			details={details}
			permission={PRODUCT_PERMISSIONS.CHANGE}
			handleDeleteConfirm={handleDeleteConfirm}
			handleEditClick={handleEditClick}
			isLoading={isLoading}
			isConfirmationModalOpen={isConfirmationModalOpen}
			setIsConfirmationModalOpen={setIsConfirmationModalOpen}
			error={error}
		/>
	)
}

export default AssetDetailsPage

export const getImageDimensions = (url: string): Promise<string | null> => {
	return new Promise((resolve) => {
		// Ensure this code runs only in the browser.
		if (typeof window === 'undefined') {
			resolve(null)
			return
		}

		const img = new Image()
		img.onload = () => {
			resolve(`${img.naturalWidth}x${img.naturalHeight}`)
		}
		img.onerror = () => {
			// Handles non-image URLs, network errors, or CORS issues.
			resolve(null)
		}
		img.src = url
	})
}

export const getExtension = (url: string): string => {
	const path = url.split('?')[0].split('#')[0]
	const lastDotIndex = path.lastIndexOf('.')
	const extension =
		lastDotIndex > 0 && lastDotIndex < path.length - 1
			? path.substring(lastDotIndex + 1).toLowerCase()
			: ''
	return extension
}

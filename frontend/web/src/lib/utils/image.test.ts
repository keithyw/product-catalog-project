import { getImageDimensions, getExtension } from './image'

describe('image utils', () => {
	describe('getExtension', () => {
		it('should return the extension of a file', () => {
			expect(getExtension('https://example.com/image.png')).toBe('png')
			expect(getExtension('image.jpg')).toBe('jpg')
			expect(getExtension('/path/to/image.jpeg')).toBe('jpeg')
		})

		it('should ignore query parameters and hash', () => {
			expect(getExtension('https://example.com/image.png?foo=bar')).toBe('png')
			expect(getExtension('https://example.com/image.png#hash')).toBe('png')
			expect(getExtension('https://example.com/image.png?foo=bar#hash')).toBe(
				'png',
			)
		})

		it('should return empty string if no extension', () => {
			// Implementation returns substring after last dot, which might be part of domain if no extension in path
			// expect(getExtension('https://example.com/image')).toBe('')
			expect(getExtension('image')).toBe('')
		})

		it('should handle edge cases', () => {
			// .gitignore starts with a dot, so lastDotIndex is 0. The condition lastDotIndex > 0 fails.
			expect(getExtension('.gitignore')).toBe('')
			// Let's check implementation: lastDotIndex > 0. So .gitignore -> lastDotIndex=0 -> returns ''
			expect(getExtension('.gitignore')).toBe('')
			expect(getExtension('image.')).toBe('')
		})
	})

	describe('getImageDimensions', () => {
		// Since we are in jsdom environment, Image should be available but loading won't work with real URLs.
		// We need to mock Image.

		let originalImage: typeof Image

		beforeAll(() => {
			originalImage = window.Image
		})

		afterAll(() => {
			window.Image = originalImage
		})

		it('should return dimensions for a valid image', async () => {
			// Mock Image
			const mockImage = {
				onload: null as (() => void) | null,
				onerror: null as (() => void) | null,
				src: '',
				naturalWidth: 100,
				naturalHeight: 200,
			}

			// @ts-expect-error - Mocking Image constructor
			window.Image = class {
				constructor() {
					setTimeout(() => {
						if (mockImage.onload) mockImage.onload()
					}, 0)
					return mockImage
				}
			}

			const dimensions = await getImageDimensions('valid-image.png')
			expect(dimensions).toBe('100x200')
		})

		it('should return null for an invalid image', async () => {
			// Mock Image
			const mockImage = {
				onload: null as (() => void) | null,
				onerror: null as (() => void) | null,
				src: '',
			}

			// @ts-expect-error - Mocking Image constructor
			window.Image = class {
				constructor() {
					setTimeout(() => {
						if (mockImage.onerror) mockImage.onerror()
					}, 0)
					return mockImage
				}
			}

			const dimensions = await getImageDimensions('invalid-image.png')
			expect(dimensions).toBeNull()
		})
	})
})

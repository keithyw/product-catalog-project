import '@testing-library/jest-dom'
import { REFRESH_TOKEN_KEY } from '@/lib/constants'

const localStorageMock = {
	getItem: jest.fn((key: string) => {
		if (key === REFRESH_TOKEN_KEY) {
			return 'mock_refresh_token'
		}
		return null
	}),
	setItem: jest.fn(),
	removeItem: jest.fn(),
	clear: jest.fn(),
	length: 0,
	key: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
	value: localStorageMock,
	writable: true,
})

Object.defineProperty(window, 'sessionStorage', {
	value: localStorageMock,
	writable: true,
})

Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: jest.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: jest.fn(), // Deprecated
		removeListener: jest.fn(), // Deprecated
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		dispatchEvent: jest.fn(),
	})),
})

// if (typeof window !== 'undefined') {
// 	// Use jest.spyOn to mock the navigation methods directly.
// 	// These are typically writable and can be spied upon.
// 	jest.spyOn(window.location, 'assign').mockImplementation(jest.fn())
// 	jest.spyOn(window.location, 'replace').mockImplementation(jest.fn())
// 	jest.spyOn(window.location, 'reload').mockImplementation(jest.fn())

// 	// Use jest.spyOn to mock the 'href' setter.
// 	// This is crucial for preventing unintended navigation when 'window.location.href = ...' is called.
// 	jest.spyOn(window.location, 'href', 'set').mockImplementation(jest.fn())
// }

// const mockLocation = {
// 	...window.location,
// 	assign: jest.fn(),
// 	replace: jest.fn(),
// 	reload: jest.fn(),
// 	// Mock href setter to prevent actual navigation during tests
// 	set href(value: string) {
// 		jest.fn((val: string) =>
// 			console.log(`Mocked window.location.href set to: ${val}`),
// 		)(value)
// 	},
// }

// Object.defineProperty(window, 'location', {
// 	configurable: true,
// 	enumerable: true,
// 	value: mockLocation,
// 	writable: true,
// })

// // If you need to mock the href getter too:
// Object.defineProperty(window.location, 'href', {
// 	get: jest.fn(() => 'http://localhost/mocked-location'), // Default mocked value
// 	set: jest.fn((value: string) => {
// 		// Optionally log or store the value if you need to assert against it
// 		console.log(`Mocked window.location.href set to: ${value}`)
// 	}),
// })

module.exports = {
	// preset: 'ts-jest',
	testEnvironment: 'jsdom',
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
		'\\.(css|less|scss|sass)$': 'identify-obj-proxy',
		'\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js',
	},
	setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
	testPathIgnorePatterns: [
		'/node_modules/',
		'/.next/',
		'/.storybook/',
		'/e2e/',
	],
	transform: {
		'^.+\\.(t|j)sx?$': ['@swc/jest'],
		// '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
	},
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
	globals: {
		'window.location': {
			assign: () => {},
			replace: () => {},
			reload: () => {},
			href: 'http://localhost/mocked-location', // Default value for href
			// Add any other properties of the Location interface if your application uses them
			// e.g., origin: 'http://localhost', pathname: '/', search: '', hash: ''
		},
	},
}

// .eslintrc.js
module.exports = {
	// 1. Specifies the parser for TypeScript
	parser: '@typescript-eslint/parser',

	// 2. Parser options for ECMAScript features
	parserOptions: {
		ecmaVersion: 2021, // Allows for the parsing of modern ECMAScript features
		sourceType: 'module', // Allows for the use of imports
		ecmaFeatures: {
			jsx: true, // Allows for the parsing of JSX
		},
	},

	// 3. Environment settings
	env: {
		browser: true, // Enables browser global variables
		es2021: true, // Adds all ECMAScript 2021 globals and automatically sets the ecmaVersion parser option to 12.
		node: true, // Enables Node.js global variables and Node.js scoping.
	},

	// 4. Set root to true to stop ESLint from looking in parent folders
	root: true,

	// 5. Extend configurations from popular presets and plugins
	extends: [
		'eslint:recommended', // ESLint's recommended rules
		'plugin:@typescript-eslint/recommended', // TypeScript ESLint's recommended rules
		'plugin:react/recommended', // React ESLint's recommended rules
		'plugin:react-hooks/recommended', // React Hooks specific rules
		'next', // Next.js specific rules
		'next/core-web-vitals', // Next.js's core web vitals rules
		'plugin:prettier/recommended', // Must be last to disable ESLint rules that conflict with Prettier
	],

	// 6. Define custom rules or override extended ones
	rules: {
		// JavaScript/General Rules
		'prefer-const': 'warn', // Warns if `let` could be `const`
		'no-var': 'error', // Disallows `var`
		'no-unused-vars': 'off', // Turn off general unused vars as TS will handle it
		'object-shorthand': ['warn', 'always'], // Enforces object shorthand syntax
		'quote-props': ['warn', 'as-needed'], // Requires quotes around object literal property names only when necessary
		semi: ['error', 'never'], // Enforce no semicolons (Prettier will handle this due to 'plugin:prettier/recommended')
		quotes: ['error', 'single'], // Enforce single quotes
		trailingComma: ['error', 'all'], // Enforce trailing commas in object and array literals
		'comma-dangle': ['error', 'always-multiline'], // Enforce trailing commas in multiline object and array literals

		// TypeScript Specific Rules
		'@typescript-eslint/no-explicit-any': 'off', // Allows `any` for flexibility
		'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Warns on unused vars, allows underscore prefix for ignored args
		'@typescript-eslint/array-type': ['warn', { default: 'array' }], // Enforces `string[]` over `Array<string>`

		// React Specific Rules
		'react/jsx-fragments': ['warn', 'syntax'], // Prefer shorthand React fragments (`<>...</>`)
		'react/jsx-filename-extension': ['warn', { extensions: ['.ts', '.tsx'] }], // Warns if JSX is not in .ts/.tsx files
		'react/react-in-jsx-scope': 'off', // Not needed for Next.js 13+ (React auto-imports)
		'react/prop-types': 'off', // Not needed when using TypeScript for prop validation

		// React Hooks Rules
		'react-hooks/exhaustive-deps': 'off', // You had this off, often for more control, but be mindful of stale closures
		'react-hooks/rules-of-hooks': 'error', // Essential: Checks rules of Hooks

		// Prettier Rule - Reports Prettier formatting issues as ESLint errors/warnings
		'prettier/prettier': ['warn', { endOfLine: 'auto' }], // Warns about Prettier conflicts, auto-detects line endings

		// Next.js specific rule (adjust as per your project's structure if needed)
		// This typically prevents using <Link href="/pages/xyz"> instead of relative paths if you're using /pages/
		// For App Router, you'll generally use relative paths like <Link href="/products/list">
		'@next/next/no-html-link-for-pages': ['off'], // Turn off as it's less relevant for App Router or specific paths
	},

	// 7. Settings that ESLint plugins use
	settings: {
		react: {
			version: 'detect', // Tells eslint-plugin-react to automatically detect the version of React to use
		},
	},

	// 8. Ignore patterns for files/directories ESLint should skip
	ignorePatterns: [
		'node_modules/',
		'.next/',
		'dist/',
		'lib/types/*', // Your specific ignore pattern
		'components/ui/*', // Your specific ignore pattern (if these are generated or handled differently)
		'*.js', // Example: ignore top-level JS config files if you're fully TS
	],
}

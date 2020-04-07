module.exports = {
	env: {
		browser: false,
		node: true,
		es6: true,
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2019,
		sourceType: 'module',
		ecmaFeatures: {
			globalReturn: true,
			impliedStrict: true,
			jsx: false,
		},
	},
	plugins: ['prettier'],
	extends: ['plugin:prettier/recommended'],
	rules: {
		indent: ['error', 'tab', { SwitchCase: 1 }],
		'linebreak-style': ['error', 'unix'],
		quotes: ['error', 'single', { avoidEscape: true }],
		'no-console': ['off'],
	},
	overrides: [
		{
			files: ['**/*.test.js'],
			env: {
				jest: true,
			},
		},
		{
			files: [
				//overrides for web libraries
				'**/packages/apps/**/*.{js,jsx,ts,tsx}',
				'**/packages/components/**/*.{js,jsx,ts,tsx}',
				'**/packages/form-components/**/*.{js,jsx,ts,tsx}',
			],
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
			env: {
				browser: true,
				node: false,
			},
			plugins: ['react', 'prettier', 'jsx-a11y', 'import'],
			extends: ['react-app', 'plugin:prettier/recommended', 'prettier/react'],
			globals: {
				process: true,
			},
		},
		{
			files: ['**/*.{ts,tsx}'],
			plugins: ['@typescript-eslint', 'prettier'],
			extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
			rules: {
				camelcase: 'off',
				'@typescript-eslint/camelcase': ['error', { properties: 'always' }],
				'@typescript-eslint/naming-convention': [
					'error',
					{ selector: 'default', format: ['camelCase'] },
					{ selector: 'variableLike', format: ['camelCase'] },
					{ selector: 'variable', format: ['camelCase', 'UPPER_CASE'] },
					{ selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
					{ selector: 'memberLike', format: ['camelCase'] },
					{
						selector: 'memberLike',
						modifiers: ['private'],
						format: ['camelCase'],
						leadingUnderscore: 'require',
					},
					{ selector: 'typeLike', format: ['PascalCase'] },
					{ selector: 'typeParameter', format: ['PascalCase'], prefix: ['T'] },
					{ selector: 'interface', format: ['PascalCase'], custom: { regex: '^I[A-Z]', match: false } },
				],
			},
			globals: {},
		},
	],
};

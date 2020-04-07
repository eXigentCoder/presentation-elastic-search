module.exports = {
	semi: true,
	trailingComma: 'all',
	singleQuote: true,
	printWidth: 100,
	tabWidth: 1,
	useTabs: true,
	quoteProps: 'as-needed',
	bracketSpacing: true,
	arrowParens: 'always',
	endOfLine: 'lf',
	jsxBracketSameLine: false,
	htmlWhitespaceSensitivity: 'strict',
	overrides: [
		{
			files: '**/package.json',
			options: {
				tabWidth: 2,
				useTabs: false,
			},
		},
	],
};

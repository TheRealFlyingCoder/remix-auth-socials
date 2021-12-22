module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'jest', 'prettier'],
	extends: ['plugin:@typescript-eslint/recommended'],
	rules: {
		'@typescript-eslint/explicit-module-boundary-types': 'off',
	},
};

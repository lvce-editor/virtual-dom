import * as config from '@lvce-editor/eslint-config'

export default [
  ...config.default,
  ...config.recommendedTsconfig,
  {
    rules: {
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/unbound-method': 'off',
      'no-console': 'off',
      'jest/no-identical-title': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      'tsconfig/no-implicit-any': 'off',
    },
  },
]

import * as config from '@lvce-editor/eslint-config'

export default [
  ...config.default,
  ...config.recommendedTsconfig,
  {
    rules: {
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      '@typescript-eslint/unbound-method': 'off',
      'tsconfig/no-implicit-any': 'off',
    },
  },
]

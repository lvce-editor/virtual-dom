import * as config from '@lvce-editor/eslint-config'
import * as actions from '@lvce-editor/eslint-plugin-github-actions'

export default [
  ...config.default,
  ...config.recommendedTsconfig,
  ...actions.default,
  {
    rules: {
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      '@typescript-eslint/unbound-method': 'off',
      'tsconfig/no-implicit-any': 'off',

      '@typescript-eslint/no-deprecated': 'off',
      'jest/no-restricted-jest-methods': 'off',
      'github-actions/ci-versions': 'off',
      'perfectionist/sort-objects': 'off',
    },
  },
]

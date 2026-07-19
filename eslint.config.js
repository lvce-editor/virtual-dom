import * as config from '@lvce-editor/eslint-config'
import * as actions from '@lvce-editor/eslint-plugin-github-actions'

export default [
  ...config.default,
  ...config.recommendedVirtualDom,
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
      'github-actions/action-versions': 'off',
      'perfectionist/sort-objects': 'off',
      '@cspell/spellchecker': 'off',
      'e2e/no-inline-nth-in-expect': 'off',
      //
    },
  },
  {
    files: ['packages/e2e/**/*.ts'],
    rules: {
      'e2e/no-imports': 'off',
    },
  },
  {
    files: ['packages/**/*.test.ts'],
    rules: {
      'virtual-dom/clickable-div-needs-role': 'off',
      'virtual-dom/no-inline-event-handlers': 'off',
      'virtual-dom/no-object-attribute-values': 'off',
      'virtual-dom/prefer-constants': 'off',
      'virtual-dom/prefer-merge-class-names': 'off',
      'virtual-dom/valid-child-count': 'off',
    },
  },
  {
    files: [
      'packages/virtual-dom-worker/src/parts/VirtualDomDiff/VirtualDomDiff.ts',
      'packages/virtual-dom/src/parts/ApplyPatch/ApplyPatch.ts',
      'packages/virtual-dom/src/parts/IpcState/IpcState.ts',
    ],
    rules: {
      'virtual-dom/prefer-state-destructuring': 'off',
    },
  },
  {
    files: ['packages/benchmark/app/app.js'],
    rules: {
      'virtual-dom/valid-child-count': 'off',
    },
  },
]

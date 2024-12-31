import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import perfectionist from 'eslint-plugin-perfectionist'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ignores: [
      'dist',
      '.tmp',
      '**/build/**',
      '**/coverage/**',
      '**/server/**',
      '**/e2e/**',
      '**/memory/**',
      '**/test-integration/**',
      '**/test-integration-util/**',
      'scripts',
      'rollup.config.js',
      'eslint.config.js',
      'packages/about-view/src/aboutWorkerMain.ts',
    ],
  },
  {
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    plugins: {
      perfectionist,
    },
    rules: {
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'natural',
          order: 'asc',
          newlinesBetween: 'never',
        },
      ],
    },
  },
)

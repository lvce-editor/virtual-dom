import { expect, test } from '@jest/globals'
import {
  getPackageBuildTsConfig,
  getPackageBuildTsConfigPath,
} from '../src/compilePackage.js'

test('getPackageBuildTsConfigPath returns temporary project path', () => {
  expect(getPackageBuildTsConfigPath({ packageName: 'virtual-dom' })).toBe(
    '.tmp/build-virtual-dom.tsconfig.json',
  )
})

test('getPackageBuildTsConfig extends package tsconfig and emits js and dts files for src only', () => {
  expect(getPackageBuildTsConfig({ packageName: 'virtual-dom-worker' })).toEqual({
    extends: '../packages/virtual-dom-worker/tsconfig.json',
    compilerOptions: {
      composite: false,
      noEmit: false,
      emitDeclarationOnly: false,
      declaration: true,
      outDir: '../dist/virtual-dom-worker/dist',
      rootDir: '../packages/virtual-dom-worker/src',
      rewriteRelativeImportExtensions: true,
    },
    include: ['../packages/virtual-dom-worker/src'],
  })
})
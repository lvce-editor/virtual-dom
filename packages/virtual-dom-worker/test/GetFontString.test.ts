import { expect, test } from '@jest/globals'
import * as GetFontString from '../src/parts/GetFontString/GetFontString.ts'

test('getFontString', () => {
  expect(GetFontString.getFontString(400, 12, 'Arial')).toBe('400 12px Arial')
  expect(GetFontString.getFontString(700, 16, 'system-ui')).toBe('700 16px system-ui')
  expect(GetFontString.getFontString(300, 14, 'monospace')).toBe('300 14px monospace')
})

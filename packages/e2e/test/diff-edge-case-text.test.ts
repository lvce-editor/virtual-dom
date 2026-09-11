import { test, expect } from '../src/fixtures.ts'
import { element, runSequence } from './edge-case-sequence-helper.ts'

const cases = [
  {
    name: 'changes only the middle of three adjacent text nodes',
    values: [
      ['left', 'old', 'right'],
      ['left', 'new', 'right'],
      ['left', '', 'right'],
    ],
  },
  {
    name: 'fills three adjacent empty text nodes independently',
    values: [
      ['', '', ''],
      ['a', '', 'c'],
      ['a', 'b', 'c'],
    ],
  },
  {
    name: 'preserves empty boundaries when shrinking the text-node list',
    values: [['', 'middle', ''], ['', ''], ['restored']],
  },
  {
    name: 'keeps whitespace-only nodes separate through updates',
    values: [
      [' ', '\t', '\n'],
      ['\n', '  ', '\t'],
      ['', '\r\n', ' '],
    ],
  },
  {
    name: 'replaces surrogate pairs without damaging adjacent text',
    values: [
      ['😀', 'end'],
      ['🧑‍💻', 'end'],
      ['𠮷', 'done'],
    ],
  },
  {
    name: 'preserves combining characters without normalizing text',
    values: [
      ['é', 'tail'],
      ['e\u{301}', 'tail'],
      ['e\u{301}\u{327}', 'tail'],
    ],
  },
  {
    name: 'renders markup-like text literally across updates',
    values: [
      ['<b>old</b>'],
      ['<script>throw 1</script>', '&amp;'],
      ['<!-- comment -->', '<img src=x>'],
    ],
  },
  {
    name: 'preserves bidirectional marks and zero-width characters',
    values: [
      ['abc'],
      ['\u{200F}שלום\u{200E}', '\u{200B}'],
      ['\u{2066}abc\u{2069}', '\u{200D}'],
    ],
  },
  {
    name: 'does not coalesce identical adjacent text nodes',
    values: [
      ['same', 'same', 'same'],
      ['same', 'different', 'same'],
      ['same', 'same', 'same'],
    ],
  },
  {
    name: 'distinguishes line endings and nonbreaking spaces',
    values: [
      ['a\r\nb', '\u{A0}'],
      ['a\nb', ' '],
      ['a\rb', '\u{2028}\u{2029}'],
    ],
  },
]

for (const scenario of cases) {
  test(`diff text sequence - ${scenario.name}`, async ({ page }) => {
    const result = await runSequence(page, {
      trees: scenario.values.map((values) =>
        element('Div', values, { id: 'target' }),
      ),
      read: { selector: '#target', childNodes: true },
    })
    expect(result).toEqual(
      scenario.values.map((values) => ({
        sameNode: true,
        childNodes: values.map((value) => ({ type: 3, value })),
      })),
    )
  })
}

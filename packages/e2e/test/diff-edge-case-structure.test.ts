import { test, expect } from '../src/fixtures.ts'
import {
  element as e,
  runSequence,
  type Tree,
} from './edge-case-sequence-helper.ts'

const table = (rows: readonly Tree[]): Tree => e('Table', [e('TBody', rows)])

const cases: readonly {
  readonly name: string
  readonly children: readonly (readonly (Tree | string)[])[]
  readonly html: readonly string[]
}[] = [
  {
    name: 'clears and repopulates two neighboring subtrees',
    children: [
      [e('Section', [e('Span', ['a'])]), e('Section', [e('P', ['b'])])],
      [e('Section'), e('Section')],
      [e('Section', [e('P', ['c'])]), e('Section', [e('Span', ['d'])])],
    ],
    html: [
      '<section><span>a</span></section><section><p>b</p></section>',
      '<section></section><section></section>',
      '<section><p>c</p></section><section><span>d</span></section>',
    ],
  },
  {
    name: 'grows one subtree while shrinking its neighbor and reverses the changes',
    children: [
      [e('Section', ['a']), e('Section', [e('Span', ['b']), e('Span', ['c'])])],
      [e('Section', [e('P', ['d']), e('P', ['e'])]), e('Section')],
      [e('Section'), e('Section', [e('Span', ['f'])])],
    ],
    html: [
      '<section>a</section><section><span>b</span><span>c</span></section>',
      '<section><p>d</p><p>e</p></section><section></section>',
      '<section></section><section><span>f</span></section>',
    ],
  },
  {
    name: 'replaces both boundary subtrees around a stable middle child',
    children: [
      [
        e('Section', [e('P', ['a'])]),
        e('Span', ['keep']),
        e('Section', [e('P', ['b'])]),
      ],
      [e('P', ['left']), e('Span', ['keep']), e('P', ['right'])],
      [e('Section', ['L']), e('Span', ['keep']), e('Section', ['R'])],
    ],
    html: [
      '<section><p>a</p></section><span>keep</span><section><p>b</p></section>',
      '<p>left</p><span>keep</span><p>right</p>',
      '<section>L</section><span>keep</span><section>R</section>',
    ],
  },
  {
    name: 'changes an empty element through text and a populated element',
    children: [
      [e('Span'), e('P', ['tail'])],
      ['', e('P', ['tail'])],
      [e('Section', [e('Span', ['new'])]), e('P', ['updated'])],
    ],
    html: [
      '<span></span><p>tail</p>',
      '<p>tail</p>',
      '<section><span>new</span></section><p>updated</p>',
    ],
  },
  {
    name: 'updates a following sibling after replacing a deeply nested subtree',
    children: [
      [e('Section', [e('Div', [e('Span', ['deep'])])]), e('P', ['before'])],
      [e('Section', ['flat']), e('P', ['after'])],
      [e('Section', [e('Div', [e('Span', ['restored'])])]), e('P', ['final'])],
    ],
    html: [
      '<section><div><span>deep</span></div></section><p>before</p>',
      '<section>flat</section><p>after</p>',
      '<section><div><span>restored</span></div></section><p>final</p>',
    ],
  },
  {
    name: 'removes and restores a nested list between text siblings',
    children: [
      ['lead', e('Ul', [e('Li', ['one']), e('Li', ['two'])]), 'tail'],
      ['lead', e('Ul'), 'tail'],
      ['L', e('Ul', [e('Li', ['three'])]), 'T'],
    ],
    html: [
      'lead<ul><li>one</li><li>two</li></ul>tail',
      'lead<ul></ul>tail',
      'L<ul><li>three</li></ul>T',
    ],
  },
  {
    name: 'replaces void children with nested content and back',
    children: [
      [e('Br'), e('Hr')],
      [e('Span', ['line']), e('Section', [e('P', ['body'])])],
      [e('Hr'), e('Br')],
    ],
    html: [
      '<br><hr>',
      '<span>line</span><section><p>body</p></section>',
      '<hr><br>',
    ],
  },
  {
    name: 'updates table cells after removing and restoring all rows',
    children: [
      [table([e('Tr', [e('Td', ['a']), e('Td', ['b'])])])],
      [table([])],
      [table([e('Tr', [e('Td', ['c'])]), e('Tr', [e('Td', ['d'])])])],
    ],
    html: [
      '<table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>',
      '<table><tbody></tbody></table>',
      '<table><tbody><tr><td>c</td></tr><tr><td>d</td></tr></tbody></table>',
    ],
  },
  {
    name: 'replaces adjacent text nodes with sibling elements and back',
    children: [
      ['a', 'b', 'c'],
      [e('Span', ['A']), e('P', ['B']), e('Span', ['C'])],
      ['x', 'y', 'z'],
    ],
    html: ['abc', '<span>A</span><p>B</p><span>C</span>', 'xyz'],
  },
  {
    name: 'patches descendants while adding and removing their parent attributes',
    children: [
      [
        e('Section', [e('Span', ['before'])], {
          className: 'old',
          title: 'old',
        }),
      ],
      [
        e('Section', [e('P', ['after']), e('Span', ['added'])], {
          className: 'new',
        }),
      ],
      [e('Section', [], { title: 'empty' })],
    ],
    html: [
      '<section class="old" title="old"><span>before</span></section>',
      '<section class="new"><p>after</p><span>added</span></section>',
      '<section title="empty"></section>',
    ],
  },
]

for (const scenario of cases) {
  test(`diff sequence - ${scenario.name}`, async ({ page }) => {
    const result = await runSequence(page, {
      trees: scenario.children.map((children) =>
        e('Div', children, { id: 'target' }),
      ),
      read: { selector: '#target', properties: ['innerHTML'] },
    })
    expect(result).toEqual(
      scenario.html.map((innerHTML) => ({ sameNode: true, innerHTML })),
    )
  })
}

import { expect, test } from '@jest/globals'
import { VirtualDomElements } from '@lvce-editor/constants'
import type { Patch } from '../src/parts/Patch/Patch.ts'
import type { VirtualDomNode } from '../src/parts/VirtualDomNode/VirtualDomNode.ts'
import { diffTrees } from '../src/parts/VirtualDomDiffTree/DiffTrees.ts'
import { removeTrailingNavigationPatches } from '../src/parts/VirtualDomDiffTree/RemoveTrailingNavigationPatches.ts'
import { diffTree } from '../src/parts/VirtualDomDiffTree/VirtualDomDiffTree.ts'
import { arrayToTree } from '../src/parts/VirtualDomTree/VirtualDomTree.ts'

test('flat traversal preserves patch order across nested forests, replacements, references and attributes', () => {
  let seed = 4653
  const next = (): number => {
    seed = (seed * 48_271) % 2_147_483_647
    return seed
  }
  const forest = (depth = 0): VirtualDomNode[] => {
    const nodes: VirtualDomNode[] = []
    const count = next() % 4
    for (let index = 0; index < count; index++) {
      const kind = next() % 4
      if (kind === 0) {
        nodes.push({
          type: VirtualDomElements.Text,
          text: `text-${next() % 7}`,
        })
      } else if (kind === 1) {
        nodes.push({
          type: VirtualDomElements.Reference,
          uid: next() % 3,
          title: `ref-${next() % 3}`,
        })
      } else {
        const children = depth < 3 ? forest(depth + 1) : []
        nodes.push(
          {
            type: kind === 2 ? VirtualDomElements.Div : VirtualDomElements.Span,
            className: `class-${next() % 3}`,
            childCount: arrayToTree(children).length,
          },
          ...children,
        )
      }
    }
    return nodes
  }

  for (let index = 0; index < 1000; index++) {
    const oldNodes = forest()
    const newNodes =
      index % 2 === 0
        ? forest()
        : oldNodes.map((node) => {
            if (next() % 3 === 0) {
              return node
            }
            if (node.type === VirtualDomElements.Text) {
              return { ...node, text: `changed-${next() % 5}` }
            }
            const changed: { className?: string; title: string; type: number } =
              {
                ...node,
                title: `title-${next() % 5}`,
              }
            delete changed.className
            return changed
          })
    const expected: Patch[] = []
    diffTrees(arrayToTree(oldNodes), arrayToTree(newNodes), expected, [])
    expect(diffTree(oldNodes, newNodes)).toEqual(
      removeTrailingNavigationPatches(expected),
    )
  }
})

/**
 * @jest-environment jsdom
 */
import { expect, test } from '@jest/globals'
import type { Patch } from '../src/parts/Patch/Patch.ts'
import * as ApplyPatch from '../src/parts/ApplyPatch/ApplyPatch.ts'
import * as PatchType from '../src/parts/PatchType/PatchType.ts'
import * as VirtualDomElements from '../src/parts/VirtualDomElements/VirtualDomElements.ts'

test('attribute change', () => {
  const patches: readonly Patch[] = [
    {
      type: PatchType.SetAttribute,
      key: 'id',
      value: 'test',
    },
  ]
  const $Node = document.createElement('div')
  ApplyPatch.applyPatch($Node, patches)
  expect($Node.id).toBe('test')
})

test('attribute remove', () => {
  const patches: readonly Patch[] = [
    {
      type: PatchType.RemoveAttribute,
      key: 'id',
    },
  ]
  const $Node = document.createElement('div')
  $Node.id = 'test'
  ApplyPatch.applyPatch($Node, patches)
  expect($Node.id).toBe('')
})

test('text change', () => {
  const patches: readonly Patch[] = [
    {
      type: PatchType.SetText,
      value: 'test',
    },
  ]
  const $Node = document.createTextNode('test')
  ApplyPatch.applyPatch($Node, patches)
  expect($Node.textContent).toBe('test')
})

test('text change of second node', () => {
  const patches: readonly Patch[] = [
    {
      type: PatchType.NavigateSibling,
      index: 1,
    },
    {
      type: PatchType.SetText,
      value: 'test',
    },
  ]
  const $Root = document.createElement('div')
  const $Child1 = document.createElement('div')
  const $Child2 = document.createTextNode('')
  $Root.append($Child1, $Child2)
  ApplyPatch.applyPatch($Child1, patches)
  expect($Child2.textContent).toBe('test')
})

test('text change of third node', () => {
  const patches: readonly Patch[] = [
    {
      type: PatchType.NavigateSibling,
      index: 2,
    },
    {
      type: PatchType.SetText,
      value: 'test',
    },
  ]
  const $Root = document.createElement('div')
  const $Child1 = document.createElement('div')
  const $Child2 = document.createElement('div')
  const $Child3 = document.createTextNode('')
  $Root.append($Child1, $Child2, $Child3)
  ApplyPatch.applyPatch($Child1, patches)
  expect($Child3.textContent).toBe('test')
})

test('text change of nested node', () => {
  const patches: readonly Patch[] = [
    {
      type: PatchType.NavigateChild,
      index: 0,
    },
    {
      type: PatchType.NavigateChild,
      index: 0,
    },
    {
      type: PatchType.SetText,
      value: 'test',
    },
  ]
  const $Root = document.createElement('div')
  const $Child1 = document.createElement('div')
  const $Child2 = document.createTextNode('')
  $Child1.append($Child2)
  $Root.append($Child1)
  ApplyPatch.applyPatch($Root, patches)
  expect($Child2.textContent).toBe('test')
})

test('element removeChild', () => {
  const patches: readonly Patch[] = [
    {
      type: PatchType.RemoveChild,
      index: 0,
    },
  ]
  const $Node = document.createElement('div')
  const $Child = document.createElement('div')
  $Node.append($Child)
  ApplyPatch.applyPatch($Node, patches)
  expect($Node.children.length).toBe(0)
})

test('element add', () => {
  const patches: readonly Patch[] = [
    {
      type: PatchType.Add,
      nodes: [
        {
          type: VirtualDomElements.Div,
          childCount: 0,
          className: 'test',
        },
      ],
    },
  ]
  const $Node = document.createElement('div')
  ApplyPatch.applyPatch($Node, patches)
  expect($Node.children.length).toBe(1)
  expect($Node.firstElementChild?.className).toBe('test')
})

test('remove and add element', () => {
  const patches: readonly Patch[] = [
    {
      type: PatchType.RemoveChild,
      index: 0,
    },
    {
      type: PatchType.Add,
      nodes: [
        {
          type: VirtualDomElements.Div,
          childCount: 0,
          className: 'test',
        },
      ],
    },
  ]
  const $Root = document.createElement('div')
  const $Child = document.createElement('div')
  $Root.append($Child)
  ApplyPatch.applyPatch($Root, patches)
  expect($Root.children.length).toBe(1)
  expect($Root.firstElementChild?.className).toBe('test')
})

test('expand search details', () => {
  const patches: readonly Patch[] = [
    {
      type: PatchType.NavigateChild,
      index: 1,
    },
    {
      type: PatchType.Add,
      nodes: [
        {
          type: VirtualDomElements.Input,
          className: 'Replace',
        },
      ],
    },
  ]
  const $Root = document.createElement('div')
  $Root.className = 'SearchHeaderTop'
  const $Toggle = document.createElement('div')
  $Toggle.className = 'Toggle'
  const $TopRight = document.createElement('div')
  $TopRight.className = 'SearchHeaderTopRight'
  const $Input = document.createElement('input')
  $Input.className = 'SearchValue'
  $TopRight.append($Input)
  $Root.append($Toggle, $TopRight)
  ApplyPatch.applyPatch($Root, patches)
  expect($TopRight.children).toHaveLength(2)
  expect($TopRight.children[1]).toBeInstanceOf(HTMLInputElement)
  expect($TopRight.children[1].className).toBe('Replace')
})

test('collapse search details', () => {
  const patches: readonly Patch[] = [
    {
      type: PatchType.NavigateChild,
      index: 1,
    },
    {
      type: PatchType.RemoveChild,
      index: 1,
    },
  ]
  const $Root = document.createElement('div')
  $Root.className = 'SearchHeaderTop'
  const $Toggle = document.createElement('div')
  $Toggle.className = 'Toggle'
  const $TopRight = document.createElement('div')
  $TopRight.className = 'SearchHeaderTopRight'
  const $Input = document.createElement('input')
  $Input.className = 'SearchValue'
  const $Replace = document.createElement('input')
  $Replace.className = 'Replace'
  $TopRight.append($Input, $Replace)
  $Root.append($Toggle, $TopRight)
  ApplyPatch.applyPatch($Root, patches)
  expect($TopRight.children).toHaveLength(1)
  expect($TopRight.children[0]).toBeInstanceOf(HTMLInputElement)
  expect($TopRight.children[0].className).toBe('SearchValue')
})

test('remove nested child node', () => {
  const patches: readonly Patch[] = [
    {
      type: PatchType.NavigateChild,
      index: 0,
    },
    {
      type: PatchType.RemoveChild,
      index: 0,
    },
  ]
  const $Root = document.createElement('div')
  $Root.className = 'Root'
  const $Child1 = document.createElement('div')
  $Child1.className = '1'
  const $Child2 = document.createElement('div')
  $Child2.className = '2'
  const $Child3 = document.createElement('div')
  $Child3.className = '3'
  $Child1.append($Child2)
  $Root.append($Child1, $Child3)
  ApplyPatch.applyPatch($Root, patches)
  expect($Root.children).toHaveLength(2)
  expect($Root.children[0]).toBeInstanceOf(HTMLDivElement)
  expect($Root.children[0].children).toHaveLength(0)
  expect($Root.children[1]).toBeInstanceOf(HTMLDivElement)
})

test('remove and add node', () => {
  const patches: readonly Patch[] = [
    {
      type: PatchType.NavigateChild,
      index: 0,
    },
    {
      type: PatchType.RemoveChild,
      index: 0,
    },
    {
      type: PatchType.Add,
      nodes: [
        {
          type: VirtualDomElements.Span,
          childCount: 0,
        },
      ],
    },
  ]
  const $Root = document.createElement('div')
  $Root.className = 'Root'
  const $Child1 = document.createElement('div')
  const $Child2 = document.createElement('div')
  const $Child3 = document.createElement('div')
  $Child1.append($Child2)
  $Root.append($Child1, $Child3)
  ApplyPatch.applyPatch($Root, patches)
  expect($Root.children).toHaveLength(2)
  expect($Root.children[0]).toBeInstanceOf(HTMLDivElement)
  expect($Root.children[0].children).toHaveLength(1)
  expect($Root.children[0].children[0]).toBeInstanceOf(HTMLSpanElement)
  expect($Root.children[1]).toBeInstanceOf(HTMLDivElement)
})

test('multiple changes', () => {
  const patches: readonly Patch[] = [
    {
      type: PatchType.NavigateChild,
      index: 0,
    },
    {
      type: PatchType.RemoveChild,
      index: 0,
    },
    {
      type: PatchType.Add,
      nodes: [
        {
          type: VirtualDomElements.Span,
          childCount: 0,
        },
      ],
    },
    {
      type: PatchType.NavigateParent,
    },
    {
      type: PatchType.RemoveChild,
      index: 1,
    },
    {
      type: PatchType.Add,
      nodes: [
        {
          type: VirtualDomElements.Span,
          childCount: 0,
        },
      ],
    },
  ]
  const $Root = document.createElement('div')
  $Root.className = 'Root'
  const $Child1 = document.createElement('div')
  const $Child2 = document.createElement('div')
  const $Child3 = document.createElement('div')
  $Child1.append($Child2)
  $Root.append($Child1, $Child3)
  ApplyPatch.applyPatch($Root, patches)
  expect($Root.children).toHaveLength(2)
  expect($Root.children[0]).toBeInstanceOf(HTMLDivElement)
  expect($Root.children[0].children).toHaveLength(1)
  expect($Root.children[0].children[0]).toBeInstanceOf(HTMLSpanElement)
  expect($Root.children[1]).toBeInstanceOf(HTMLSpanElement)
})

test('large patch', () => {
  const $Root = document.createElement('div')
  $Root.innerHTML = `<div class="Viewlet Search"><div class="SearchHeader" role="none"><div class="SearchHeaderTop" role="none"><button class="IconButton SearchToggleButton SearchToggleButtonExpanded" title="Toggle Replace" aria-label="Toggle Replace" aria-expanded="true" data-command="toggleReplace" name="ToggleReplace" classname="IconButton SearchToggleButton" ariaexpanded="false"><div class="MaskIcon MaskIconChevronDown" classname="MaskIcon MaskIconChevronRight"></div></button><div class="SearchHeaderTopRight" role="none"><div class="SearchField" role="none"><textarea class="MultilineInputBox" spellcheck="false" autocapitalize="off" placeholder="Search" name="SearchValue"></textarea><div class="SearchFieldButtons"><button class="SearchFieldButton" name="MatchCase" title="Match Case" role="checkbox" aria-checked="false" tabindex="0"><span class="MaskIcon MaskIconCaseSensitive"></span></button><button class="SearchFieldButton" name="MatchWholeWord" title="Match Whole Word" role="checkbox" aria-checked="false" tabindex="0"><span class="MaskIcon MaskIconWholeWord"></span></button><button class="SearchFieldButton" name="UseRegularExpression" title="Use Regular Expression" role="checkbox" aria-checked="false" tabindex="0"><span class="MaskIcon MaskIconRegex"></span></button></div></div><div class="SearchFieldContainer" role="none"><div class="SearchField" role="none"><textarea class="MultilineInputBox" spellcheck="false" autocapitalize="off" placeholder="Replace" name="ReplaceValue"></textarea><div class="SearchFieldButtons"><button class="SearchFieldButton" name="PreserveCase" title="Preserve Case" role="checkbox" aria-checked="false" tabindex="0"><span class="MaskIcon MaskIconPreserveCase"></span></button></div></div><button class="SearchFieldButton SearchFieldButtonDisabled" name="ReplaceAll" title="Replace All" role="checkbox" aria-checked="false" tabindex="0"><span class="MaskIcon MaskIconReplaceAll"></span></button></div></div></div><div class="SearchHeaderDetails"><div class="ViewletSearchMessage" role="status" tabindex="0">No results found</div><div class="ToggleDetails" role="button" tabindex="0" aria-label="Toggle Search Details" title="Toggle Search Details"><div class="MaskIcon MaskIconEllipsis"></div></div></div></div><div class="Viewlet List Tree" role="tree" tabindex="0"><div class="TreeItems" id="TreeItems" style="top: 0px;"></div></div></div>`
  const patches: readonly Patch[] = [
    {
      type: PatchType.NavigateChild,
      index: 0,
    },
    {
      type: PatchType.NavigateChild,
      index: 0,
    },
    {
      type: PatchType.NavigateChild,
      index: 0,
    },
    {
      type: PatchType.SetAttribute,
      key: 'className',
      value: 'IconButton SearchToggleButton',
    },
    {
      type: PatchType.SetAttribute,
      key: 'ariaExpanded',
      value: false,
    },
    {
      type: PatchType.NavigateChild,
      index: 0,
    },
    {
      type: PatchType.SetAttribute,
      key: 'className',
      value: 'MaskIcon MaskIconChevronRight',
    },
    {
      type: PatchType.NavigateParent,
    },
    {
      type: PatchType.NavigateParent,
    },
    {
      type: PatchType.NavigateParent,
    },
    {
      type: PatchType.RemoveChild,
      index: 1,
    },
  ]
  ApplyPatch.applyPatch($Root.firstChild as HTMLElement, patches)
  expect($Root.innerHTML).toBe(
    `<div class="Viewlet Search">
      <div class="SearchHeader" role="none">
        <div class="SearchHeaderTop" role="none">
          <button class="IconButton SearchToggleButton SearchToggleButtonExpanded" title="Toggle Replace" aria-label="Toggle Replace" aria-expanded="true" data-command="toggleReplace" name="ToggleReplace" classname="IconButton SearchToggleButton" ariaexpanded="false">
            <div class="MaskIcon MaskIconChevronDown" classname="MaskIcon MaskIconChevronRight"></div>
          </button>
          <div class="SearchHeaderTopRight" role="none">
            <div class="SearchField" role="none">
              <textarea class="MultilineInputBox" spellcheck="false" autocapitalize="off" placeholder="Search" name="SearchValue"></textarea>
            <div class="SearchFieldButtons">
              <button class="SearchFieldButton" name="MatchCase" title="Match Case" role="checkbox" aria-checked="false" tabindex="0">
                <span class="MaskIcon MaskIconCaseSensitive"></span>
              </button>
              <button class="SearchFieldButton" name="MatchWholeWord" title="Match Whole Word" role="checkbox" aria-checked="false" tabindex="0">
                <span class="MaskIcon MaskIconWholeWord"></span>
              </button><button class="SearchFieldButton" name="UseRegularExpression" title="Use Regular Expression" role="checkbox" aria-checked="false" tabindex="0">
                <span class="MaskIcon MaskIconRegex"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
          <div class="Viewlet List Tree" role="tree" tabindex="0"><div class="TreeItems" id="TreeItems" style="top: 0px;"></div>
        </div></div>`,
  )
})

import { diffTree } from './packages/virtual-dom-worker/dist/index.js'
import fs from 'fs'

// Read the fixture file
const content = fs.readFileSync(
  './packages/e2e/fixtures/diff/extension-search-results.js',
  'utf-8',
)

// Extract initialDom and updatedDom from the file
const match = content.match(/const initialDom = \[([\s\S]*?)\]\s*renderInto/)
const match2 = content.match(
  /const updatedDom = \[([\s\S]*?)\]\s*const patches/,
)

if (!match || !match2) {
  console.error('Could not extract DOM data from file')
  process.exit(1)
}

// Create eval-safe versions
const initialDomStr = '[' + match[1] + ']'
const updatedDomStr = '[' + match2[1] + ']'

const initialDom = eval(initialDomStr)
const updatedDom = eval(updatedDomStr)

console.log('Initial DOM length:', initialDom.length)
console.log('Updated DOM length:', updatedDom.length)
console.log('Initial root:', JSON.stringify(initialDom[0], null, 2))
console.log('Updated root:', JSON.stringify(updatedDom[0], null, 2))

const patches = diffTree(initialDom, updatedDom)
console.log('\nPatches generated:')
console.log(JSON.stringify(patches, null, 2))

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { analyzeCpuProfiles } from './cpuProfile.ts'

void test('analyzeCpuProfiles filters virtual dom functions and includes descendants', () => {
  const analysis = analyzeCpuProfiles([
    {
      contextName: 'worker: explorerViewWorkerMain.js',
      file: './profiles/01-worker.cpuprofile',
      profile: {
        endTime: 3000,
        nodes: [
          {
            callFrame: {
              codeType: 'other',
              columnNumber: 0,
              functionName: '(root)',
              lineNumber: 0,
              url: '',
            },
            children: [2],
            id: 1,
          },
          {
            callFrame: {
              codeType: 'JS',
              columnNumber: 0,
              functionName: 'diffTree',
              lineNumber: 0,
              url: 'http://localhost/explorerViewWorkerMain.js',
            },
            children: [3],
            id: 2,
          },
          {
            callFrame: {
              codeType: 'JS',
              columnNumber: 0,
              functionName: 'renderExplorer',
              lineNumber: 0,
              url: 'http://localhost/explorerViewWorkerMain.js',
            },
            children: [],
            id: 3,
          },
        ],
        samples: [2, 3],
        startTime: 0,
        timeDeltas: [1000, 2000],
      },
      targetInfo: {
        targetId: 'target-1',
        title: 'explorerViewWorkerMain.js',
        type: 'worker',
        url: 'http://localhost/explorerViewWorkerMain.js',
      },
    },
  ])

  assert.equal(analysis.profileCount, 1)
  assert.equal(analysis.sampleCount, 2)
  assert.equal(analysis.totalProfiledMs, 3)
  assert.equal(analysis.virtualDomSelfMs, 1)
  assert.equal(analysis.virtualDomInclusiveMs, 3)
  assert.deepEqual(analysis.hotspots[0], {
    columnNumber: 0,
    contexts: ['worker: explorerViewWorkerMain.js'],
    functionName: 'diffTree',
    inclusiveMs: 3,
    lineNumber: 0,
    samples: 1,
    selfMs: 1,
    url: 'http://localhost/explorerViewWorkerMain.js',
  })
})

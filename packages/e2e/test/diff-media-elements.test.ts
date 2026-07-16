import { test, expect } from '../src/fixtures.ts'

test('diff - audio and video reflected properties', async ({ page }) => {
  await page.goto('/diff/media-elements.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const result = await page.evaluate(() => {
    // @ts-ignore
    return globalThis.__virtualDomMediaElementsResult
  })

  expect(result.afterUpdate.audio).toEqual({
    controls: true,
    loop: true,
    muted: true,
    playbackRate: 1.25,
    preload: 'metadata',
    volume: 0.75,
  })
  expect(result.afterUpdate.video).toEqual({
    controls: false,
    loop: true,
    muted: false,
    playsInline: true,
    poster: '/after.png',
    width: '640px',
    height: '360px',
  })
  expect(result.afterRemoval).toEqual({
    audioControls: false,
    audioLoop: false,
    videoPlaysInline: false,
    videoPoster: null,
    videoWidth: '',
    videoHeight: '',
    status: 'removed optional properties',
  })
})

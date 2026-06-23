import { test, expect } from '../src/fixtures.ts'

test('broad attribute and prop e2e coverage', async ({ page }) => {
  await page.goto('/diff/attribute-prop-broad.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const result = await page.evaluate(() => {
    // @ts-ignore
    return globalThis.__virtualDomBroadAttributePropResult
  })

  expect(result.htmlFor).toEqual({
    afterUpdate: 'after-input',
    afterRemove: null,
  })
  expect(result.ariaAttributes.afterOptionalRemoval).toEqual({
    active: null,
    owns: null,
    controls: 'panel-2',
    labelledBy: 'label-2',
  })
  expect(result.ariaAttributes.afterMappedRemoval).toEqual({
    controls: null,
    labelledBy: null,
  })
  expect(result.idClassData).toEqual({
    afterUpdate: {
      id: 'identity-after',
      className: 'after-class',
      dataOne: '10',
      dataTwo: undefined,
      dataTwoAttribute: null,
    },
    afterRemove: {
      id: null,
      className: null,
      dataOne: null,
    },
  })
  expect(result.booleanishProps).toEqual({
    disabled: false,
    hidden: false,
    draggable: false,
    contentEditable: 'false',
  })
  expect(result.styleAndDimensionProps.afterUpdate).toMatchObject({
    width: '30px',
    height: '40px',
    top: '8px',
    left: '9px',
    marginTop: '10px',
    paddingLeft: '11px',
    paddingRight: '12px',
    translate: '3px 4px',
    imageWidth: 22,
    imageHeight: 23,
  })
  expect(result.styleAndDimensionProps.afterUpdate.maskImage).toContain(
    'after.svg',
  )
  expect(result.styleAndDimensionProps.afterUpdate.webkitMaskImage).toContain(
    'after.svg',
  )
  expect(result.styleAndDimensionProps.afterPixelRemoval).toEqual({
    width: '',
    height: '',
    top: '',
    left: '',
    marginTop: '',
    paddingLeft: '',
    paddingRight: '',
    translate: '5px 6px',
    imageWidthAttribute: null,
    imageHeightAttribute: null,
  })
})

import {
  applyPatch,
  renderInto,
  VirtualDomElements,
} from '/dist/virtual-dom/dist/index.js'
import { diffTree } from '/dist/virtual-dom-worker/dist/index.js'

const $container = document.getElementById('diff-container')

const item = (name, className, role = 'tab', extra = {}) => ({
  ariaLabel: '',
  childCount: 0,
  className: `ActivityBarItem ${className}`,
  name,
  role,
  title: name,
  type: VirtualDomElements.Div,
  ...extra,
})

const explorer = {
  ...item('Explorer', 'ActivityBarItemSelected'),
  ariaSelected: true,
  childCount: 1,
}

const explorerIcon = {
  childCount: 0,
  className: 'MaskIcon MaskIconFiles',
  name: 'Explorer',
  role: 'none',
  type: VirtualDomElements.Div,
}

const extensions = item('Extensions', 'IconExtensions', 'tab', {
  ariaSelected: false,
})

const account = item('Account', 'MarginTopAuto IconAccount', 'button', {
  ariaHasPopup: true,
})

const settings = item('Settings', 'IconSettingsGear', 'button', {
  ariaHasPopup: true,
})

const getActivityBarDom = (includeExtensions) => {
  const items = [
    explorer,
    explorerIcon,
    item('Search', 'IconSearch', 'tab', { ariaSelected: false }),
    item('Source Control', 'IconSourceControl', 'tab', {
      ariaSelected: false,
    }),
    item('Run and Debug', 'IconDebugAlt2', 'tab', {
      ariaSelected: false,
    }),
    ...(includeExtensions ? [extensions] : []),
    account,
    settings,
  ]
  return [
    {
      ariaOrientation: 'vertical',
      ariaRoleDescription: 'Activity Bar',
      childCount: includeExtensions ? 7 : 6,
      className: 'Viewlet ActivityBar',
      id: 'ActivityBar',
      role: 'toolbar',
      tabIndex: 0,
      type: VirtualDomElements.Div,
    },
    ...items,
  ]
}

const initialDom = getActivityBarDom(true)
const withoutExtensionsDom = getActivityBarDom(false)

renderInto($container, initialDom)

const $root = $container.firstElementChild
applyPatch($root, diffTree(initialDom, withoutExtensionsDom))

const afterRemoval = {
  accountCount: $container.querySelectorAll('[title="Account"]').length,
  extensionsCount: $container.querySelectorAll('[title="Extensions"]').length,
  itemCount: $container.querySelectorAll('.ActivityBarItem').length,
  rootPreserved: $container.firstElementChild === $root,
  settingsCount: $container.querySelectorAll('[title="Settings"]').length,
}

applyPatch($root, diffTree(withoutExtensionsDom, initialDom))

window.__virtualDomActivityBarResult = {
  afterRemoval,
  afterReinsertion: {
    accountCount: $container.querySelectorAll('[title="Account"]').length,
    extensionsCount: $container.querySelectorAll('[title="Extensions"]').length,
    itemCount: $container.querySelectorAll('.ActivityBarItem').length,
    rootPreserved: $container.firstElementChild === $root,
    settingsCount: $container.querySelectorAll('[title="Settings"]').length,
  },
}
window.__virtualDomDiffTestComplete = true

import { patchDom, text } from './broad-test-helpers.js'
import { renderInto, VirtualDomElements } from '/dist/virtual-dom/dist/index.js'

const $container = document.getElementById('diff-container')

const initialDom = [
  {
    type: VirtualDomElements.Div,
    id: 'media-root',
    childCount: 3,
  },
  {
    type: VirtualDomElements.Audio,
    id: 'media-audio',
    controls: false,
    loop: false,
    muted: false,
    preload: 'none',
    volume: 0.25,
    childCount: 0,
  },
  {
    type: VirtualDomElements.Video,
    id: 'media-video',
    controls: true,
    loop: false,
    muted: true,
    playsInline: false,
    poster: '/before.png',
    width: 320,
    height: 180,
    childCount: 0,
  },
  {
    type: VirtualDomElements.P,
    id: 'media-status',
    childCount: 1,
  },
  text('before'),
]

const updatedDom = [
  {
    type: VirtualDomElements.Div,
    id: 'media-root',
    childCount: 3,
  },
  {
    type: VirtualDomElements.Audio,
    id: 'media-audio',
    controls: true,
    loop: true,
    muted: true,
    playbackRate: 1.25,
    preload: 'metadata',
    volume: 0.75,
    childCount: 0,
  },
  {
    type: VirtualDomElements.Video,
    id: 'media-video',
    controls: false,
    loop: true,
    muted: false,
    playsInline: true,
    poster: '/after.png',
    width: 640,
    height: 360,
    childCount: 0,
  },
  {
    type: VirtualDomElements.P,
    id: 'media-status',
    childCount: 1,
  },
  text('after'),
]

const removedDom = [
  {
    type: VirtualDomElements.Div,
    id: 'media-root',
    childCount: 3,
  },
  {
    type: VirtualDomElements.Audio,
    id: 'media-audio',
    muted: true,
    playbackRate: 1.25,
    preload: 'metadata',
    volume: 0.75,
    childCount: 0,
  },
  {
    type: VirtualDomElements.Video,
    id: 'media-video',
    controls: false,
    loop: true,
    muted: false,
    childCount: 0,
  },
  {
    type: VirtualDomElements.P,
    id: 'media-status',
    childCount: 1,
  },
  text('removed optional properties'),
]

renderInto($container, initialDom)
const $root = $container.firstElementChild
let dom = patchDom($root, initialDom, updatedDom)
const $audio = document.getElementById('media-audio')
const $video = document.getElementById('media-video')

const afterUpdate = {
  audio: {
    controls: $audio.controls,
    loop: $audio.loop,
    muted: $audio.muted,
    playbackRate: $audio.playbackRate,
    preload: $audio.preload,
    volume: $audio.volume,
  },
  video: {
    controls: $video.controls,
    loop: $video.loop,
    muted: $video.muted,
    playsInline: $video.playsInline,
    poster: $video.getAttribute('poster'),
    width: $video.style.width,
    height: $video.style.height,
  },
}

patchDom($root, dom, removedDom)

window.__virtualDomMediaElementsResult = {
  afterUpdate,
  afterRemoval: {
    audioControls: $audio.controls,
    audioLoop: $audio.loop,
    videoPlaysInline: $video.playsInline,
    videoPoster: $video.getAttribute('poster'),
    videoWidth: $video.style.width,
    videoHeight: $video.style.height,
    status: document.getElementById('media-status').textContent,
  },
}
window.__virtualDomDiffTestComplete = true

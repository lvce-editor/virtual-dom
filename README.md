# virtual dom

## Experimental node recycling

`createRenderer({ cache: { dom: 100, text: 100 } })` creates an isolated renderer
with bounded caches (both default to zero). Call `renderer.render(nodes, eventMap,
newEventMap)` to create a view root and `renderer.dispose(root)` when that view is
finished. Disposal removes the root and empties owned nodes; future renders reuse
compatible nodes. `renderer.clearCache()` releases cached nodes.

This experiment requires exclusive ownership of the rendered trees: do not add
external listeners, attach application state, patch them, or move nodes between
views. Reference subtrees are externally owned and are not recycled. Only plain
layout elements with supported attribute/style/event props are eligible; form
controls, SVG, custom elements, and unknown properties are discarded. Cached
elements lose all attributes and library listeners; text is cleared immediately.
The root wrapper itself is not cached. Existing `render`/`renderInto` are unchanged.
No performance improvement is assumed; benchmark the workload before adopting.

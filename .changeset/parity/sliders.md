---
"beatmapper": minor
---

## General Changes

- Added interactive support for _arcs_ and _chains_ within the editor, as well as proper visualization across all views:
  - Arcs and chains use the same anchored placement controls as obstacles.
    - The selected color (as indicated by the color note tool) determines the color of newly-placed arcs and chains.
    - The selected direction determines the _tail direction_ for arcs and has no effect for chains.
  - Each slider exposes a set of _control points_ as indicated by brightly colored spheres/cones, which mark the respective head and tail position(s) and enable interactivity.
    - For arcs, firing `ALT+SCROLL` will modify the _length multiplier_ of the control point at that end, whereas `ALT+WASD` will update the arc's _mid-anchor mode_. By default, all newly placed arcs will use length multipliers of `1.0` and `Straight` mid-anchor mode.
    - For chains, firing `ALT+SCROLL` will modify the _slice count_, whereas `ALT+SHIFT+SCROLL` will update the _squish factor_. By default, all newly placed chains will use a slice count of `5` and squish factor of `1.0`.
  - When the head/tail of a slider overlaps with a color note, it will inherit compatible properties from the note and propagate changes for in-place modifications (`ALT+`).
  - The opacity of arcs/chains will be reduced as they fall outside the active surface depth for each corresponding view.
  - Hitsounds are also supported for chains, with proper sync for beat distribution and squish factor.

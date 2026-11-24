---
"beatmapper": minor
---

## General Changes

- Added support for _NJS events_ within the editor, as well as proper visualization across all views:
  - A dedicated event track for NJS changes is now available within the Lightshow view.
  - Newly-placed events inherit the beatmap's base NJS value, and `ALT+SCROLL` will increment/decrement that value by 1 as you scroll.
    - Holding down `ALT` during placement will set the "Use Previous" state for that event, and value/easings will be ignored.
    - The selected effect controls the easing type of newly placed events (from a subset of available types), and additional easing types are accessible via the property editor.
  - All objects are now displayed within the Lightshow view's toggleable preview, so you can easily observe NJS changes without having to constantly switch between views.
    - The Status Bar will also show a "Current NJS" stat within the Preview view as a useful reference.

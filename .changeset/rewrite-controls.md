---
"beatmapper": minor
---

## General Changes

- The toggle for camera movement/rotation has been changed to right click (as opposed to shift) to allow camera controls to align more closely with traditional workflows from other editors.
- Certain hotkeys have been remapped to more intuitive combinations and sequences to reduce collisions and align with traditional layouts and intents.
- The "snap precision" selector has been changed to an input-based field to allow greater customization of precision values.
	- `CTRL+{1-9}` will update the snap precision to `1/{1-9}` respectively, and each base will now support up to 5 steps of precision between `1/1` and `1/32`.

## Technical Changes

- The camera logic has been rewritten as a component-based controller model for better composability and customizability.

## Bugfixes

- The camera now enforces pointer-lock behavior when rotation and movement controls are active.

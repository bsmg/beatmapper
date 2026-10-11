---
"beatmapper": minor
---

## General Changes

- The toggle for camera movement/rotation has been changed to right click (as opposed to shift) to allow camera controls to align more closely with traditional workflows from other editors.
- Certain hotkeys have been remapped to more intuitive combinations and sequences to reduce collisions and align with traditional layouts and intents.
- The "snap precision" selector has been changed to an input-based field to allow greater customization of precision values.
	- `CTRL+{1-9}` will update the snap precision to `1/{1-9}` respectively, and each base will now support up to 5 steps of precision between `1/1` and `1/32`.
- The jump navigation shortcuts have been streamlined to a more unified control scheme:
	- The buttons for "Jump Forwards/Backwards" will now advance by your active snap precision and will only jump larger distances when holding down the `Mod` key.
	- The hotkeys for "Jump Forwards/Backwards" actions have been inverted for consistency with other navigation hotkeys.
	- You can now customize the window size for "Jump Forwards/Backwards" actions within views that support object visualization.
	- The distance for the "Nudge Selection" actions are now unified with the "Jump Forwards/Backwards" actions, which now offers the ability to nudge selected objects across window ranges.
	- The "Jump to Start/End" actions will now jump between your active bookmarks (as well as the first and last measured beats of your song).

## Technical Changes

- The camera logic has been rewritten as a component-based controller model for better composability and customizability.

## Bugfixes

- The camera now enforces pointer-lock behavior when rotation and movement controls are active.

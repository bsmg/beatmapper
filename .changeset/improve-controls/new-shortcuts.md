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
- A dedicated "form editor" is now available for bulk modification of object/event properties. You can trigger this prompt via `Mod+E` or associated buttons while objects/events are selected.
	- When multiple types of objects/events are selected, the form editor will only display the properties that are shared between collections.
	- Any property fields left blank will preserve the original values set for each object.
- The "Color Note" tool has been consolidated into a single button, where you can now middle click the button (or press `1` again) to swap the active color set. This change will better inform the workflows for upcoming feature additions using a more consistent control scheme.
	- As a side effect of these changes, the "Left Note" tool will now be inaccessible in beatmaps set to the "One Saber" characteristic to better align with base-game behavior.
- New interactive buttons have been added to the event grid to better illustrate supported controls and make the editor more pointer-driveable.
	- These changes also introduce new dedicated actions for mirroring the light color for a selection of basic events. 
- The "Download Map" action has been consolidated into a prompt as opposed to a dedicated page, which better illustrates the action as an effectful operation.
	- This change also allows customization options to be accessible when triggering the action via hotkey.

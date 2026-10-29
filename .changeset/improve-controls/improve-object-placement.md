---
"beatmapper": minor
---

## General Changes

- The pointer controls for object placement have been reworked, such that placing an object will now keep the cursor anchored at the position where you first clicked as opposed to having tentative objects follow the cursor as you scroll. This change aims to make placements feel more responsive and align with workflows from other editors.
	- For object types with a start and end position (such as obstacles and sliders), you can now scroll while holding down left click to modify the duration without needing to release the click. This works for both scroll directions; the time and duration values will automatically compensate for deltas.
	- For object types with a fixed position (such as notes and bombs), the cursor will remain in the anchored position until you release left click to commit the placement action. All navigation-related actions that jump the cursor will also be temporarily disabled until you release the click.
	- These improvements come with one notable breaking change: *the default obstacle duration is no longer tracked in state and will not be reflected for tentative obstacle placements*, since the new workflow is arguably more responsive compared to the old workflow where this workaround doesn't offer the same meaningful utility as before.
- New controls are available for in-place modification of objects based on common workflows from other editors:
	- You can now hover over a note and press `ALT+W/S/A/D/F` to update the direction of the note in-place. This also supports the quality-of-life shortcuts used by other editors for angled dot notes as well as automatically resetting angle offset when the direction is updated.
	- The behavior of `ALT+SCROLL` has been changed to modify cut direction for color notes, and `ALT+SHIFT+SCROLL` is the new shortcut for angle offset. This change should hopefully create more alignment with control schemes from other editors.
	- You can now change the step size used for angle offset modification via a new dedicated setting in the Controls tab.

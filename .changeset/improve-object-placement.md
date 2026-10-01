---
"beatmapper": minor
---

## General Changes

- The pointer controls for object placement have been reworked, such that placing an object will now keep the cursor anchored at the position where you first clicked as opposed to having tentative objects follow the cursor as you scroll. This change aims to make placements feel more responsive and align with workflows from other editors.
	- For object types with a start and end position (such as obstacles and sliders), you can now scroll while holding down left click to modify the duration without needing to release the click. This works for both scroll directions; the time and duration values will automatically compensate for deltas.
	- For object types with a fixed position (such as notes and bombs), the cursor will remain in the anchored position until you release left click to commit the placement action. All navigation-related actions that jump the cursor will also be temporarily disabled until you release the click.
	- These improvements come with one notable breaking change: *the default obstacle duration is no longer tracked in state and will not be reflected for tentative obstacle placements*, since the new workflow is arguably more responsive compared to the old workflow where this workaround doesn't offer the same meaningful utility as before.

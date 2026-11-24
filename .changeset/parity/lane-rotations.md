---
"beatmapper": minor
---

## General Changes

- Added support for _lane rotation_ properties across beatmap objects and navigation controls:
  - These capabilities are only active for beatmaps that set the `360Degree` or `90Degree` characteristic. You can also apply lane rotations to compatible objects within other characteristics using the property editor.
	  - The `90Degree` characteristic will clamp all rotation actions within supported ranges (-45 to 45) as a quality-of-life feature.
  - Pressing `ArrowLeft/ArrowRight` (or clicking the corresponding buttons) will rotate the active lane to the left/right respectively.
  - Pressing `SHIFT+ArrowLeft/ArrowRight` will rotate all selected objects to the left/right respectively.
  - The step value used for rotation controls is set to 15 degrees by default. You can customize this value via the Controls tab of the Settings menu.
  - Cross-compatibility is supported for converting rotation events to lane rotations and vice-versa, so long as _all lane rotation properties are mappable to a global timeline_.

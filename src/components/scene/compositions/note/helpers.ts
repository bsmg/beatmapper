import { NoteDirection } from "bsmap";

import { blockCenterUrl, blockDirectionalUrl } from "$/assets";

export function resolvePathForNoteDirection(direction: number) {
	// If the direction is >=1000, we'll want to use mapping extensions.
	// - for 2000-2360 range, it should be a dot note
	if (direction >= 2000) return blockCenterUrl;
	// - for 1000-1360 range, it should be directional
	if (direction >= 1000) return blockDirectionalUrl;

	switch (direction) {
		case NoteDirection.UP:
		case NoteDirection.DOWN:
		case NoteDirection.LEFT:
		case NoteDirection.RIGHT:
		case NoteDirection.UP_LEFT:
		case NoteDirection.UP_RIGHT:
		case NoteDirection.DOWN_LEFT:
		case NoteDirection.DOWN_RIGHT: {
			return blockDirectionalUrl;
		}
		case NoteDirection.ANY: {
			return blockCenterUrl;
		}
		default: {
			throw new Error(`Unrecognized direction: ${direction}`);
		}
	}
}

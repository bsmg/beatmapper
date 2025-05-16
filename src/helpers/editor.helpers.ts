/**
 * This function provides the range of visible beats, from the placement grid to the far edge of the available space.
 */
export function calculateVisibleRange(cursorPositionInBeats: number, numOfBeatsInRange: number, { includeSpaceBeforeGrid } = { includeSpaceBeforeGrid: false }) {
	const numOfBeatsBeforeGrid = includeSpaceBeforeGrid ? numOfBeatsInRange * 0.2 : 0;
	return [cursorPositionInBeats - numOfBeatsBeforeGrid, cursorPositionInBeats + numOfBeatsInRange];
}

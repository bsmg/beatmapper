/**
 * This function provides the range of visible beats, from the placement grid to the far edge of the available space.
 */
export function calculateVisibleRange(cursorPositionInBeats: number, numOfBeatsInRange: number, numOfBeatsBeforeGrid?: number) {
	return [cursorPositionInBeats - (numOfBeatsBeforeGrid ?? 0), cursorPositionInBeats + numOfBeatsInRange];
}

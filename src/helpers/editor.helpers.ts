/**
 * This function provides the range of visible beats, from the placement grid to the far edge of the available space.
 */
export function calculateVisibleRange(cursorPositionInBeats: number, numOfBeatsInRange: number, numOfBeatsBeforeGrid?: number) {
	return [cursorPositionInBeats - (numOfBeatsBeforeGrid ?? 0), cursorPositionInBeats + numOfBeatsInRange];
}

export function calculateQuickSelectRange(range: string, currentBeat: number, fudgeFactor: number = 0) {
	const trimmed = range.trim();

	let rawStart: string;
	let rawEnd: string | undefined;

	if (trimmed.startsWith("-")) {
		const secondIndex = trimmed.indexOf("-", 1);

		if (secondIndex !== -1) {
			rawStart = trimmed.slice(0, secondIndex);
			rawEnd = trimmed.slice(secondIndex + 1);
		} else {
			rawStart = trimmed;
			rawEnd = undefined;
		}
	} else {
		const parts = trimmed.split("-");
		rawStart = parts[0];
		rawEnd = parts[1];
	}

	const isRelative = rawStart.startsWith("+") || rawStart.startsWith("-");
	const startValue = Number.parseFloat(rawStart);

	let startBeat: number;
	let endBeat: number;

	if (rawEnd === undefined) {
		if (isRelative) {
			if (startValue >= 0) {
				startBeat = currentBeat;
				endBeat = currentBeat + startValue;
			} else {
				startBeat = currentBeat + startValue;
				endBeat = currentBeat;
			}
		} else {
			startBeat = startValue;
			endBeat = startValue;
		}
	} else {
		startBeat = startValue;
		endBeat = Number.parseFloat(rawEnd) - fudgeFactor;
	}

	return [startBeat, endBeat] as const;
}

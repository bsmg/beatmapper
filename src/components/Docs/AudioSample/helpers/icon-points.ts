export function getStopIconPoints({ size, progressCircleWidth }: { size: number; progressCircleWidth: number }) {
	const innerSize = getInnerSize({ size, progressCircleWidth });

	return [
		[innerSize * 0.3 + progressCircleWidth, innerSize * 0.3 + progressCircleWidth],
		[innerSize * 0.3 + progressCircleWidth, innerSize * 0.7 + progressCircleWidth],
		[innerSize * 0.7 + progressCircleWidth, innerSize * 0.7 + progressCircleWidth],
		[innerSize * 0.7 + progressCircleWidth, innerSize * 0.3 + progressCircleWidth],
	];
}

export function getPlayIconPoints({ size, progressCircleWidth }: { size: number; progressCircleWidth: number }) {
	const innerSize = getInnerSize({ size, progressCircleWidth });

	return [
		[(innerSize * 7) / 20 + progressCircleWidth, (innerSize * 1) / 4 + progressCircleWidth],
		[(innerSize * 7) / 20 + progressCircleWidth, (innerSize * 3) / 4 + progressCircleWidth],
		[(innerSize * 31) / 40 + progressCircleWidth, (innerSize * 1) / 2 + progressCircleWidth],
		[(innerSize * 31) / 40 + progressCircleWidth, (innerSize * 1) / 2 + progressCircleWidth],
	];
}

function getInnerSize({ size, progressCircleWidth }: { size: number; progressCircleWidth: number }) {
	return size - progressCircleWidth * 2;
}

import { useMemo } from "react";

import { SONG_OFFSET, SURFACE_DEPTHS } from "$/constants";
import { useAppSelector } from "$/store/hooks";
import { selectActiveSongId, selectBeatDepth, selectCursorPositionInBeats, selectDurationInBeats, selectGraphicsQuality } from "$/store/selectors";
import { range } from "$/utils";

import Marker from "./Marker";

const BarMarkers = () => {
	const songId = useAppSelector(selectActiveSongId);
	const durationInBeats = useAppSelector((state) => selectDurationInBeats(state, songId));
	const cursorPositionInBeats = useAppSelector((state) => selectCursorPositionInBeats(state, songId));
	const beatDepth = useAppSelector(selectBeatDepth);
	const graphicsLevel = useAppSelector(selectGraphicsQuality);

	const surfaceDepth = SURFACE_DEPTHS[graphicsLevel];
	const numToRender = surfaceDepth / beatDepth;

	const totalNumOfBeats = useMemo(() => Math.ceil(durationInBeats ?? 0), [durationInBeats]);

	const linesArray = useMemo(() => range(totalNumOfBeats * 4), [totalNumOfBeats]);

	const visibleSubsetOfLines = linesArray.filter((i) => {
		const beat = i / 4;

		// I want to truncate all lines before the cursorPosition, but if I use the exact value, sometimes the line right AT the cursor gets cut off.
		// Add a tiny fudge factor to allow a bit of leniency
		const FUDGE_FACTOR = 0.1;

		return beat >= (cursorPositionInBeats ?? 0) - FUDGE_FACTOR && beat < (cursorPositionInBeats ?? 0) + numToRender + FUDGE_FACTOR;
	});

	return visibleSubsetOfLines.map((i) => {
		const isBeat = i % 4 === 0;
		const type = isBeat ? "beat" : "sub-beat";

		return <Marker key={i} beatNum={i / 4} offset={-SONG_OFFSET + -i * (beatDepth / 4)} type={type} />;
	});
};

export default BarMarkers;

import { useMemo } from "react";

import { SONG_OFFSET } from "$/components/scene/constants";
import { SURFACE_DEPTHS } from "$/constants";
import { useAppSelector } from "$/store/hooks";
import { selectBeatDepth, selectCursorPositionInBeats, selectDurationInBeats, selectGraphicsQuality } from "$/store/selectors";
import type { SongId } from "$/types";
import { range } from "$/utils";

import { BeatMarker } from "$/components/scene/compositions";

interface Props {
	sid: SongId;
}
function EditorBeatMarkers({ sid }: Props) {
	const durationInBeats = useAppSelector((state) => selectDurationInBeats(state, sid));
	const cursorPositionInBeats = useAppSelector((state) => selectCursorPositionInBeats(state, sid));
	const beatDepth = useAppSelector(selectBeatDepth);
	const graphicsLevel = useAppSelector(selectGraphicsQuality);

	const surfaceDepth = useMemo(() => SURFACE_DEPTHS[graphicsLevel], [graphicsLevel]);
	const numToRender = useMemo(() => surfaceDepth / beatDepth, [surfaceDepth, beatDepth]);

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

		return <BeatMarker key={i} beatNum={i / 4} offset={-SONG_OFFSET + -i * (beatDepth / 4)} type={type} />;
	});
}

export default EditorBeatMarkers;

import { useParams, useRouteContext } from "@tanstack/react-router";
import { useMemo } from "react";

import { SONG_OFFSET } from "$/components/scene/constants";
import { BeatMarkers } from "$/components/scene/layouts";
import { useAppSelector } from "$/store/hooks";
import { selectDurationInBeats, selectEditorOffsetInBeats, selectSnap } from "$/store/selectors";
import { getComputedToken } from "$/styles/helpers";

interface Props {
	timescale: (time: number) => number;
	beatDepth: number;
}
function EditorBeatMarkers({ timescale, beatDepth }: Props) {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid/_" });
	const { theme } = useRouteContext({ from: "__root__" });

	const snapDivision = useAppSelector((state) => Math.max(1 / selectSnap(state), 1));
	const durationInBeats = useAppSelector((state) => selectDurationInBeats(state, sid));
	const offsetInBeats = useAppSelector((state) => selectEditorOffsetInBeats(state, sid));

	const marks = useMemo(() => Array.from({ length: Math.ceil(((durationInBeats ?? 0) - offsetInBeats) * snapDivision) + 1 }, (_, i) => i / snapDivision), [snapDivision, durationInBeats, offsetInBeats]);

	return (
		<BeatMarkers.Root marks={marks}>
			{(beatNum, { isBeat }) => {
				const color = isBeat ? getComputedToken("colors.fg.contrast") : getComputedToken(`colors.gray.${theme === "dark" ? 300 : 700}`);
				const zPosition = -SONG_OFFSET - timescale(beatNum) * beatDepth;
				return (
					<BeatMarkers.Marker key={beatNum} type={isBeat ? "beat" : "sub-beat"} height={isBeat ? 0.2 : 0.08} overextendBy={isBeat ? 0.3 : 0} color={color} position-z={zPosition}>
						{isBeat && beatNum}
					</BeatMarkers.Marker>
				);
			}}
		</BeatMarkers.Root>
	);
}

export default EditorBeatMarkers;

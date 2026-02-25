import { useParams, useRouteContext } from "@tanstack/react-router";
import { useMemo } from "react";

import { SONG_OFFSET } from "$/components/scene/constants";
import { BeatMarkers } from "$/components/scene/layouts";
import { useAppSelector } from "$/store/hooks";
import { selectDurationInBeats, selectSnap } from "$/store/selectors";
import { getComputedToken } from "$/styles/helpers";

interface Props {
	beatDepth: number;
}
function EditorBeatMarkers({ beatDepth }: Props) {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid/_" });
	const { theme } = useRouteContext({ from: "__root__" });

	const snapDivision = useAppSelector((state) => Math.max(1 / selectSnap(state), 1));
	const durationInBeats = useAppSelector((state) => selectDurationInBeats(state, sid));

	const marks = useMemo(() => Array.from({ length: Math.ceil((durationInBeats ?? 0) * snapDivision) + 1 }, (_, i) => i / snapDivision), [snapDivision, durationInBeats]);

	return (
		<BeatMarkers.Root marks={marks}>
			{(beatNum, { isBeat }) => {
				const color = isBeat ? getComputedToken("colors.fg.contrast") : getComputedToken(`colors.gray.${theme === "dark" ? 300 : 700}`);
				return (
					<BeatMarkers.Marker key={beatNum} type={isBeat ? "beat" : "sub-beat"} height={isBeat ? 0.2 : 0.08} overextendBy={isBeat ? 0.3 : 0} color={color} position-z={-SONG_OFFSET - beatNum * beatDepth}>
						{isBeat && beatNum}
					</BeatMarkers.Marker>
				);
			}}
		</BeatMarkers.Root>
	);
}

export default EditorBeatMarkers;

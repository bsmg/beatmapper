import { useMemo } from "react";

import { resolveColorForItem } from "$/helpers/colors.helpers";
import { useAppSelector } from "$/store/hooks";
import { selectColorScheme, selectEventEditorStartAndEndBeat } from "$/store/selectors";
import type { BeatmapId, IBackgroundBox, SongId } from "$/types";
import { normalize } from "$/utils";

import { styled } from "$:styled-system/jsx";

interface Props {
	sid: SongId;
	bid: BeatmapId;
	box: IBackgroundBox;
}
function EventGridBackgroundBox({ sid, bid, box }: Props) {
	const { startBeat, endBeat } = useAppSelector((state) => selectEventEditorStartAndEndBeat(state, sid));
	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid, bid));

	const styles = useMemo(() => {
		const startOffset = normalize(box.beatNum, startBeat, endBeat, 0, 100);
		const width = normalize(box.duration ?? 0, 0, endBeat - startBeat, 0, 100);
		return {
			left: `${startOffset}%`,
			width: `${width}%`,
			background: resolveColorForItem(box.colorType, { customColors: colorScheme }),
		};
	}, [box, startBeat, endBeat, colorScheme]);

	return <Wrapper style={styles} />;
}

const Wrapper = styled("div", {
	base: {
		position: "absolute",
		height: "100%",
		opacity: 0.2,
	},
});

export default EventGridBackgroundBox;

import { useMemo } from "react";

import { resolveColorForItem } from "$/helpers/colors.helpers";
import { useAppSelector } from "$/store/hooks";
import { selectCustomColors, selectEnvironment, selectEventEditorStartAndEndBeat } from "$/store/selectors";
import type { IBackgroundBox, SongId } from "$/types";
import { normalize } from "$/utils";

import { styled } from "$:styled-system/jsx";

interface Props {
	sid: SongId;
	box: IBackgroundBox;
}
function EventGridBackgroundBox({ sid, box }: Props) {
	const { startBeat, endBeat } = useAppSelector((state) => selectEventEditorStartAndEndBeat(state, sid));
	const environment = useAppSelector((state) => selectEnvironment(state, sid));
	const customColors = useAppSelector((state) => selectCustomColors(state, sid));

	const styles = useMemo(() => {
		const startOffset = normalize(box.beatNum, startBeat, endBeat, 0, 100);
		const width = normalize(box.duration ?? 0, 0, endBeat - startBeat, 0, 100);
		return {
			left: `${startOffset}%`,
			width: `${width}%`,
			background: resolveColorForItem(box.colorType, { environment, customColors }),
		};
	}, [box, startBeat, endBeat, environment, customColors]);

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

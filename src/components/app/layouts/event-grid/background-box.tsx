import { useParams } from "@tanstack/react-router";
import { useMemo } from "react";

import { resolveColorForItem } from "$/helpers/colors.helpers";
import { useAppSelector } from "$/store/hooks";
import { selectColorScheme, selectEventEditorStartAndEndBeat } from "$/store/selectors";
import type { IBackgroundBox } from "$/types";
import { clamp, normalize } from "$/utils";
import { styled } from "$:styled-system/jsx";

interface Props {
	box: IBackgroundBox;
}
function EventGridBackgroundBox({ box }: Props) {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid" });

	const { startBeat, endBeat } = useAppSelector((state) => selectEventEditorStartAndEndBeat(state, sid));
	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid, bid));

	const styles = useMemo(() => {
		const startOffset = normalize(box.time, startBeat, endBeat, 0, 100);
		const width = normalize(box.duration ?? 0, 0, endBeat - startBeat, 0, 100);
		const startColor = resolveColorForItem(box.startColor, { colorScheme });
		const endColor = resolveColorForItem(box.endColor, { colorScheme });
		return {
			left: `${startOffset}%`,
			width: `${width}%`,
			background: `linear-gradient(to right, color-mix(in srgb, ${startColor}, transparent ${clamp(1 - (box.startBrightness ?? 0), 0, 1) * 100}%), color-mix(in srgb, ${endColor ?? startColor}, transparent ${clamp(1 - (box.endBrightness ?? 0), 0, 1) * 100}%))`,
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

import { useMemo } from "react";

import { For } from "$/components/ui/atoms";
import { useAppSelector } from "$/store/hooks";
import { selectSnap } from "$/store/selectors";
import { normalize } from "$/utils";
import { styled } from "$:styled-system/jsx";
import { token } from "$:styled-system/tokens";
import { useEventGridContext } from "./context";

function EventGridMarkers() {
	const snapTo = useAppSelector(selectSnap);

	const { startBeat, endBeat, dimensions } = useEventGridContext();

	const markers = useMemo(() => {
		const lines: { key: string; x: number; isPrimary: boolean }[] = [];
		const firstLine = Math.ceil(startBeat / snapTo) * snapTo;

		for (let b = firstLine; b < endBeat; b += snapTo) {
			const x = normalize(b, startBeat, endBeat, 0, dimensions.width);

			const remainder = Math.abs(b % 1);
			const isPrimary = remainder < 0.001 || Math.abs(remainder - 1) < 0.001;

			lines.push({ key: b.toFixed(4), x, isPrimary });
		}
		return lines;
	}, [startBeat, endBeat, snapTo, dimensions.width]);

	return (
		<Wrapper role="presentation" width={dimensions.width} height={dimensions.height}>
			<For each={markers}>{({ key, x, isPrimary }) => <line key={key} x1={x} y1={isPrimary ? -6 : 0} x2={x} y2={dimensions.height} stroke={token.var(isPrimary ? "colors.border.default" : "colors.border.subtle")} strokeWidth={1} />}</For>
		</Wrapper>
	);
}

const Wrapper = styled("svg", {
	base: {
		position: "absolute",
		inset: 0,
	},
});

export default EventGridMarkers;

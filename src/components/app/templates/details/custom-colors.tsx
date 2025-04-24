import { parseColor } from "@ark-ui/react/color-picker";

import { BEATMAP_COLOR_KEY_RENAME } from "$/constants";
import { updateModColor, updateModColorOverdrive } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectCustomColors } from "$/store/selectors";
import { App, type SongId } from "$/types";

import { VStack, styled } from "$:styled-system/jsx";
import { vstack, wrap } from "$:styled-system/patterns";
import { ColorPicker, Heading, Slider } from "$/components/ui/compositions";

interface Props {
	sid: SongId;
}
function CustomColorSettings({ sid }: Props) {
	const dispatch = useAppDispatch();
	const customColors = useAppSelector((state) => selectCustomColors(state, sid));

	return (
		<Row>
			{Object.values(App.BeatmapColorKey).map((elementId) => {
				const color = customColors[elementId];
				const overdrive = customColors[`${elementId}Overdrive`];
				return (
					<Cell key={elementId}>
						<VStack gap={2}>
							<ColorPicker size="lg" value={parseColor(color)} onValueChange={(details) => sid && dispatch(updateModColor({ songId: sid, element: elementId, color: details.valueAsString }))} />
							<Heading rank={3}>{BEATMAP_COLOR_KEY_RENAME[elementId]}</Heading>
						</VStack>
						<VStack gap={1}>
							<Heading rank={4}>Overdrive</Heading>
							<Slider size="sm" min={0} max={1} step={0.01} value={[overdrive]} onValueChange={(details) => sid && dispatch(updateModColorOverdrive({ songId: sid, element: elementId, overdrive: details.value[0] }))} />
						</VStack>
					</Cell>
				);
			})}
		</Row>
	);
}

const Row = styled("div", {
	base: wrap.raw({
		paddingBlock: 4,
	}),
});

const Cell = styled("div", {
	base: vstack.raw({
		gap: 3,
		flex: 1,
	}),
});

export default CustomColorSettings;

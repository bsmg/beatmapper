import { parseColor } from "@ark-ui/react/color-picker";

import { BEATMAP_COLOR_KEY_RENAME } from "$/constants";
import { updateModColor } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectColorScheme } from "$/store/selectors";
import { App, type BeatmapId, type SongId } from "$/types";

import { VStack, styled } from "$:styled-system/jsx";
import { vstack, wrap } from "$:styled-system/patterns";
import { ColorPicker, Heading } from "$/components/ui/compositions";

interface Props {
	sid: SongId;
	bid?: BeatmapId;
}
function CustomColorSettings({ sid, bid }: Props) {
	const dispatch = useAppDispatch();
	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid, bid));

	return (
		<Row>
			{Object.values(App.ColorSchemeKey).map((key) => {
				return (
					<Cell key={key}>
						<VStack gap={2}>
							<ColorPicker size="lg" value={parseColor(colorScheme[key])} onValueChange={(details) => sid && dispatch(updateModColor({ songId: sid, element: key, color: details.valueAsString }))} />
							<Heading rank={3}>{BEATMAP_COLOR_KEY_RENAME[key]}</Heading>
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

import { parseColor } from "@ark-ui/react/color-picker";

import { BEATMAP_COLOR_KEY_RENAME } from "$/constants";
import { toggleModForSong, updateModColor, updateModColorOverdrive } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectActiveSongId, selectCustomColors } from "$/store/selectors";
import { App } from "$/types";

import { VStack, styled } from "$:styled-system/jsx";
import { vstack, wrap } from "$:styled-system/patterns";
import { Checkbox, ColorPicker, Heading, Slider, Text } from "$/components/ui/compositions";
import { Link } from "@tanstack/react-router";
import QuestionTooltip from "../QuestionTooltip";

const CustomColorSettings = () => {
	const songId = useAppSelector(selectActiveSongId);
	const customColors = useAppSelector((state) => selectCustomColors(state, songId));
	const dispatch = useAppDispatch();

	return (
		<Wrapper>
			<Checkbox id="enable-colors" checked={customColors.isEnabled} onCheckedChange={() => songId && dispatch(toggleModForSong({ songId, mod: "customColors" }))}>
				Enable custom colors{" "}
				<QuestionTooltip>
					Override the default red/blue color scheme. Use "overdrive" to produce some neat effects.{" "}
					<Text asChild textStyle={"link"} colorPalette={"yellow"} color={"colorPalette.500"}>
						<Link to="/docs/$" params={{ _splat: "mods#custom-colors" }}>
							Learn more
						</Link>
					</Text>
					.
				</QuestionTooltip>
			</Checkbox>

			{customColors.isEnabled && (
				<Row>
					{Object.values(App.BeatmapColorKey).map((elementId) => {
						const color = customColors[elementId];
						const overdrive = customColors[`${elementId}Overdrive`];
						return (
							<Cell key={elementId}>
								<VStack gap={2}>
									<ColorPicker size="lg" value={parseColor(color)} onValueChange={(details) => songId && dispatch(updateModColor({ songId, element: elementId, color: details.valueAsString }))} />
									<Heading rank={3}>{BEATMAP_COLOR_KEY_RENAME[elementId]}</Heading>
								</VStack>
								<VStack gap={1}>
									<Heading rank={4}>Overdrive</Heading>
									<Slider size="sm" min={0} max={1} step={0.01} value={[overdrive]} onValueChange={(details) => songId && dispatch(updateModColorOverdrive({ songId, element: elementId, overdrive: details.value[0] }))} />
								</VStack>
							</Cell>
						);
					})}
				</Row>
			)}
		</Wrapper>
	);
};

const Wrapper = styled("div", {
	base: {
		userSelect: "none",
	},
});

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

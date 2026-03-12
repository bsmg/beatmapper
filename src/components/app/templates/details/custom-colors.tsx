import { parseColor } from "@ark-ui/react/color-picker";
import { useParams } from "@tanstack/react-router";
import { useCallback, useState } from "react";

import { For } from "$/components/ui/atoms";
import { ColorPicker, Heading, Switch } from "$/components/ui/compositions";
import { updateCustomColor } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectColorScheme, selectCustomColor } from "$/store/selectors";
import { ColorSchemeKey } from "$/types";
import { styled, VStack } from "$:styled-system/jsx";
import { wrap } from "$:styled-system/patterns";

const BEATMAP_COLOR_KEY_RENAME = {
	[ColorSchemeKey.SABER_LEFT]: "Left Saber",
	[ColorSchemeKey.SABER_RIGHT]: "Right Saber",
	[ColorSchemeKey.OBSTACLE]: "Obstacles",
	[ColorSchemeKey.ENV_LEFT]: "Light 1",
	[ColorSchemeKey.ENV_RIGHT]: "Light 2",
	[ColorSchemeKey.ENV_WHITE]: "Light W",
	[ColorSchemeKey.BOOST_LEFT]: "Boost 1",
	[ColorSchemeKey.BOOST_RIGHT]: "Boost 2",
	[ColorSchemeKey.BOOST_WHITE]: "Boost W",
} as const;

function CustomColorSwatch({ element }: { element: ColorSchemeKey }) {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const dispatch = useAppDispatch();
	const customColor = useAppSelector((state) => selectCustomColor(state, sid, element));
	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid));

	const [color, setColor] = useState(customColor ?? colorScheme[element]);
	const [active, setActive] = useState(!!customColor);

	const handleUpdate = useCallback(
		(value: string | undefined) => {
			dispatch(updateCustomColor({ songId: sid, key: element, value: active ? value : undefined }));
		},
		[active, dispatch, sid, element],
	);

	return (
		<VStack gap={2}>
			<ColorPicker size="lg" value={parseColor(color ?? "black")} onValueChange={(x) => setColor(x.value.toString("hex"))} onValueChangeEnd={(x) => handleUpdate(x.value.toString("hex"))} />
			<Heading rank={3}>{BEATMAP_COLOR_KEY_RENAME[element]}</Heading>
			<Switch checked={active} onCheckedChange={(x) => setActive(!!x.checked)} />
		</VStack>
	);
}

function CustomColorSettings() {
	return (
		<Row>
			<For each={Object.values(ColorSchemeKey)}>{(element) => <CustomColorSwatch key={element} element={element} />}</For>
		</Row>
	);
}

const Row = styled("div", {
	base: wrap.raw({
		paddingBlock: 4,
		"& > *": {
			width: "100%",
			flex: 1,
		},
	}),
});

export default CustomColorSettings;

import { parseColor } from "@ark-ui/react/color-picker";
import type { SwitchCheckedChangeDetails } from "@ark-ui/react/switch";
import { useParams } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";

import { For } from "$/components/ui/atoms";
import { ColorPicker, Switch } from "$/components/ui/compositions";
import { useAppSelector } from "$/store/hooks";
import { selectColorScheme } from "$/store/selectors";
import { ColorSchemeKey, type IColorScheme } from "$/types";
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

interface Props {
	element: ColorSchemeKey;
	toggleable?: boolean;
	colorScheme: Partial<IColorScheme>;
	onColorChange: (element: ColorSchemeKey, color: string, active: boolean) => void;
}
function ColorSwatch({ element, toggleable, colorScheme, onColorChange }: Props) {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const currentColorScheme = useAppSelector((state) => selectColorScheme(state, sid));

	const [currentColor, setCurrentColor] = useState(colorScheme[element] ?? currentColorScheme[element]);
	const active = useMemo(() => !!colorScheme[element], [colorScheme, element]);

	const handleUpdate = useCallback(
		(value: string) => {
			onColorChange(element, value, active);
		},
		[element, active, onColorChange],
	);

	const handleActiveChange = useCallback(
		(x: SwitchCheckedChangeDetails) => {
			if (!currentColor) return;
			onColorChange(element, currentColor, x.checked);
		},
		[element, currentColor, onColorChange],
	);

	return (
		<VStack gap={2}>
			<ColorPicker size="lg" label={BEATMAP_COLOR_KEY_RENAME[element]} orientation={"vertical"} value={parseColor(currentColor ?? "black")} onValueChange={(x) => setCurrentColor(x.value.toString("hex"))} onValueChangeEnd={(x) => handleUpdate(x.value.toString("hex"))} />
			{toggleable && <Switch checked={!!colorScheme[element]} onCheckedChange={handleActiveChange} />}
		</VStack>
	);
}

function ColorScheme({ toggleable, colorScheme, onColorChange }: Omit<Props, "element">) {
	return (
		<Row>
			<For each={Object.values(ColorSchemeKey)}>{(element) => <ColorSwatch key={element} element={element} toggleable={toggleable} colorScheme={colorScheme} onColorChange={onColorChange} />}</For>
		</Row>
	);
}

const Row = styled("div", {
	base: wrap.raw({
		paddingBlock: 2,
		"& > *": {
			width: "100%",
			flex: 1,
		},
	}),
});

export default ColorScheme;

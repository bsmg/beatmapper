import { parseColor } from "@ark-ui/react/color-picker";
import { useDeferredValue, useEffect, useState } from "react";

import { updateCustomColor } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectColorScheme, selectCustomColors } from "$/store/selectors";
import { ColorSchemeKey, type SongId } from "$/types";

import { VStack, styled } from "$:styled-system/jsx";
import { vstack, wrap } from "$:styled-system/patterns";
import { ColorPicker, Heading, Switch } from "$/components/ui/compositions";

const BEATMAP_COLOR_KEY_RENAME = {
	[ColorSchemeKey.SABER_LEFT]: "Left Saber",
	[ColorSchemeKey.SABER_RIGHT]: "Right Saber",
	[ColorSchemeKey.ENV_LEFT]: "Environment 1",
	[ColorSchemeKey.ENV_RIGHT]: "Environment 2",
	[ColorSchemeKey.BOOST_LEFT]: "Boost 1",
	[ColorSchemeKey.BOOST_RIGHT]: "Boost 2",
	[ColorSchemeKey.OBSTACLE]: "Obstacles",
} as const;

interface Props {
	sid: SongId;
}
function ElementControl({ sid, element }: Props & { element: ColorSchemeKey }) {
	const dispatch = useAppDispatch();
	const customColors = useAppSelector((state) => selectCustomColors(state, sid));
	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid));

	const [color, setColor] = useState(customColors?.[element] ?? colorScheme[element]);
	const [active, setActive] = useState(!!customColors?.[element]);

	const deferredColor = useDeferredValue(color);

	useEffect(() => {
		dispatch(updateCustomColor({ songId: sid, key: element, value: active ? deferredColor : undefined }));
	}, [active, deferredColor, dispatch, sid, element]);

	return (
		<Cell>
			<VStack gap={2}>
				<ColorPicker size="lg" value={parseColor(color ?? "black")} onValueChange={(x) => setColor(`#${x.value.toHexInt().toString(16)}`)} />
				<Heading rank={3}>{BEATMAP_COLOR_KEY_RENAME[element]}</Heading>
				<Switch checked={active} onCheckedChange={(x) => setActive(!!x.checked)} />
			</VStack>
		</Cell>
	);
}

function CustomColorSettings({ sid }: Props) {
	return (
		<Row>
			{Object.values(ColorSchemeKey).map((element) => {
				return <ElementControl key={element} sid={sid} element={element} />;
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

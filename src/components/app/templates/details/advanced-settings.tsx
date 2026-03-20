import { useParams } from "@tanstack/react-router";

import { ColorScheme, Module } from "$/components/app/compositions";
import { RouterLink } from "$/components/ui/compositions";
import { updateCustomColors, updateModuleEnabled } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectCustomColors, selectModuleEnabled } from "$/store/selectors";
import { Stack } from "$:styled-system/jsx";

function AdvancedSettingsDetails() {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const dispatch = useAppDispatch();
	const customColors = useAppSelector((state) => selectCustomColors(state, sid));
	const enabledCustomColors = useAppSelector((state) => selectModuleEnabled(state, sid, "customColors"));
	const enabledMappingExtensions = useAppSelector((state) => selectModuleEnabled(state, sid, "mappingExtensions"));

	return (
		<Stack gap={3}>
			<Module
				label="Custom Colors"
				render={() => <ColorScheme toggleable colorScheme={customColors} onColorChange={(key, color, active) => dispatch(updateCustomColors({ songId: sid, changes: { [key]: active ? color : undefined } }))} />}
				checked={enabledCustomColors}
				onCheckedChange={() => dispatch(updateModuleEnabled({ songId: sid, key: "customColors" }))}
			>
				Override individual elements of a beatmap's color scheme.{" "}
				<RouterLink target="_self" to="/docs/$" params={{ _splat: "mods#custom-color-overrides" }}>
					Learn more
				</RouterLink>
				.
			</Module>
			<Module label="Mapping Extensions" render={() => null} checked={enabledMappingExtensions} onCheckedChange={() => dispatch(updateModuleEnabled({ songId: sid, key: "mappingExtensions" }))}>
				Allows you to customize size and shape of the grid, to place notes outside of the typical 4×3 grid.{" "}
				<RouterLink target="_self" to="/docs/$" params={{ _splat: "mods#mapping-extensions" }}>
					Learn more
				</RouterLink>
				.
			</Module>
		</Stack>
	);
}

export default AdvancedSettingsDetails;

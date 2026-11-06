import { useHotkey, useHotkeyStore } from "@ark-ui/react/hotkeys";
import { useParams, useRouteContext } from "@tanstack/react-router";
import { Layers3Icon, SplineIcon } from "lucide-react";
import { useCallback, useEffect, useMemo } from "react";

import { getHotkeyCategory, getHotkeyScopes } from "$/components/app/helpers";
import { ActionPanelGroup } from "$/components/app/layouts";
import { BombNoteIcon, ColorNoteIcon, ObstacleIcon } from "$/components/icons";
import { Button, Tooltip } from "$/components/ui/compositions";
import { resolveColorForItem } from "$/helpers/colors.helpers";
import { updateNotesEditorColor, updateNotesEditorType } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectBeatmapById, selectColorScheme, selectNotesEditorColor, selectNotesEditorType } from "$/store/selectors";
import { ColorSchemeKey, ObjectColor, ObjectType } from "$/types";
import { cycle } from "$/utils";

function NoteToolActionPanelGroup() {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid/_" });
	const { view } = useRouteContext({ from: "/_/edit/$sid/$bid/_/_scene/notes" });

	const dispatch = useAppDispatch();
	const beatmap = useAppSelector((state) => selectBeatmapById(state, sid, bid));
	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid, bid));
	const selectedType = useAppSelector(selectNotesEditorType);
	const selectedColor = useAppSelector(selectNotesEditorColor);

	const isOneSaber = useMemo(() => beatmap.characteristic === "OneSaber", [beatmap.characteristic]);
	const hasColorProperty = useMemo(() => selectedType === ObjectType.NOTE || selectedType === ObjectType.ARC || selectedType === ObjectType.CHAIN, [selectedType]);

	useEffect(() => {
		if (isOneSaber) {
			dispatch(updateNotesEditorColor(ObjectColor.RIGHT));
		}
	}, [dispatch, isOneSaber]);

	const handleCycleColor = useCallback(() => {
		if (isOneSaber) return;

		if (hasColorProperty) {
			const nextColor = cycle([ObjectColor.LEFT, ObjectColor.RIGHT], selectedColor);
			dispatch(updateNotesEditorColor(nextColor));
		}
	}, [dispatch, isOneSaber, hasColorProperty, selectedColor]);

	const handleUpdateTool = useCallback(
		(type: ObjectType) => {
			if (type === selectedType && hasColorProperty) {
				handleCycleColor();
			} else {
				dispatch(updateNotesEditorType(type));
			}
		},
		[dispatch, selectedType, hasColorProperty, handleCycleColor],
	);

	const hotkeys = useHotkeyStore();

	const scopes = useMemo(() => getHotkeyScopes(view), [view]);
	const category = useMemo(() => getHotkeyCategory(scopes), [scopes]);

	const enabled = useCallback(() => !hotkeys.getActiveScopes().includes("camera"), [hotkeys.getActiveScopes]);

	useHotkey({ scopes, category, enabled, label: "Pick Color Note Tool", hotkey: "1", action: () => handleUpdateTool(ObjectType.NOTE) });
	useHotkey({ scopes, category, enabled, label: "Pick Bomb Note Tool", hotkey: "2", action: () => handleUpdateTool(ObjectType.BOMB) });
	useHotkey({ scopes, category, enabled, label: "Pick Obstacle Tool", hotkey: "3", action: () => handleUpdateTool(ObjectType.OBSTACLE) });
	useHotkey({ scopes, category, enabled, label: "Pick Arc Tool", hotkey: "4", action: () => handleUpdateTool(ObjectType.ARC) });
	useHotkey({ scopes, category, enabled, label: "Pick Chain Tool", hotkey: "5", action: () => handleUpdateTool(ObjectType.CHAIN) });

	return (
		<ActionPanelGroup.Root label="Tool">
			<ActionPanelGroup.Section>
				<Tooltip render={() => "Color Note"}>
					<Button variant="ghost" size="icon" aria-pressed={selectedType === ObjectType.NOTE} unfocusOnPress onClick={() => dispatch(updateNotesEditorType(ObjectType.NOTE))} onAuxClick={handleCycleColor}>
						<ColorNoteIcon size={20} color={resolveColorForItem(selectedColor === ObjectColor.LEFT ? ColorSchemeKey.SABER_LEFT : ColorSchemeKey.SABER_RIGHT, { colorScheme })} />
					</Button>
				</Tooltip>
				<Tooltip render={() => "Bomb Note"}>
					<Button variant="ghost" size="icon" aria-pressed={selectedType === ObjectType.BOMB} unfocusOnPress onClick={() => dispatch(updateNotesEditorType(ObjectType.BOMB))}>
						<BombNoteIcon size={20} />
					</Button>
				</Tooltip>
				<Tooltip render={() => "Obstacle"}>
					<Button variant="ghost" size="icon" aria-pressed={selectedType === ObjectType.OBSTACLE} unfocusOnPress onClick={() => dispatch(updateNotesEditorType(ObjectType.OBSTACLE))}>
						<ObstacleIcon size={20} color={resolveColorForItem(ObjectType.OBSTACLE, { colorScheme })} />
					</Button>
				</Tooltip>
				<Tooltip render={() => "Arc"}>
					<Button variant="ghost" size="icon" aria-pressed={selectedType === ObjectType.ARC} unfocusOnPress onClick={() => dispatch(updateNotesEditorType(ObjectType.ARC))}>
						<SplineIcon size={20} />
					</Button>
				</Tooltip>
				<Tooltip render={() => "Chain"}>
					<Button variant="ghost" size="icon" aria-pressed={selectedType === ObjectType.CHAIN} unfocusOnPress onClick={() => dispatch(updateNotesEditorType(ObjectType.CHAIN))}>
						<Layers3Icon size={20} />
					</Button>
				</Tooltip>
			</ActionPanelGroup.Section>
		</ActionPanelGroup.Root>
	);
}

export default NoteToolActionPanelGroup;

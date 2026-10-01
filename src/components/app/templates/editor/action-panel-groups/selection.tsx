import { useHotkey } from "@ark-ui/react/hotkeys";
import { useRouteContext } from "@tanstack/react-router";
import { ArrowDownToLineIcon, ArrowUpToLineIcon, FlipHorizontal2Icon, FlipVertical2Icon } from "lucide-react";
import { type MouseEventHandler, useMemo } from "react";

import { getHotkeyCategory, getHotkeyScopes } from "$/components/app/helpers";
import { ActionPanelGroup } from "$/components/app/layouts";
import { Show } from "$/components/ui/atoms";
import { Button, Tooltip } from "$/components/ui/compositions";
import { deselectAllEntities, deselectAllObjectsOfType, mirrorSelection, nudgeSelection, removeAllSelectedObjects, toggleSelectAllEntities } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectSelectedBeatmapEntities } from "$/store/selectors";
import { ObjectType } from "$/types";
import { StrikethroughOnHover, Text } from "$:styled-system/jsx";

interface CountProps {
	num: number;
	label: string;
	onClick: MouseEventHandler;
}
function SelectionCount({ num, label, onClick }: CountProps) {
	const pluralizedLabel = useMemo(() => (num === 1 ? label : `${label}s`), [num, label]);

	return (
		<StrikethroughOnHover as={Button} color="red.500" onClick={onClick}>
			<Text color="yellow.500" fontWeight={"bold"}>
				{num}
			</Text>{" "}
			{pluralizedLabel}
		</StrikethroughOnHover>
	);
}

function SelectionActionPanelGroup() {
	const { view } = useRouteContext({ from: "/_/edit/$sid/$bid/_" });

	const dispatch = useAppDispatch();
	const selectedEntities = useAppSelector((state) => selectSelectedBeatmapEntities(state, view));

	const scopes = useMemo(() => getHotkeyScopes(view), [view]);
	const category = useMemo(() => getHotkeyCategory(scopes), [scopes]);

	useHotkey({ scopes, category, label: "Mirror Selection Horizontally", hotkey: "H", action: () => dispatch(mirrorSelection({ axis: "horizontal" })) });
	useHotkey({ scopes, category, label: "Mirror Selection Vertically", hotkey: "V", action: () => dispatch(mirrorSelection({ axis: "vertical" })) });

	useHotkey({ scopes, category, label: "Nudge Selection Forwards", hotkey: "Alt+ArrowUp", action: () => dispatch(nudgeSelection({ direction: "forwards" })) });
	useHotkey({ scopes, category, label: "Nudge Selection Backwards", hotkey: "Alt+ArrowDown", action: () => dispatch(nudgeSelection({ direction: "backwards" })) });

	useHotkey({ scopes, category, label: "Select All Objects", hotkey: "Mod+A", action: () => dispatch(toggleSelectAllEntities()) });
	useHotkey({ scopes, category, label: "Deselect All Objects", hotkey: "Escape", action: () => dispatch(deselectAllEntities()) });
	useHotkey({ scopes, category, label: "Delete Selection", hotkey: "Delete", action: () => dispatch(removeAllSelectedObjects()) });

	return (
		<ActionPanelGroup.Root label="Selection">
			<ActionPanelGroup.ActionGroup gap="md">
				<Show when={selectedEntities.notes}>{(items) => <SelectionCount key="blocks" num={items.length} label="note" onClick={() => dispatch(deselectAllObjectsOfType({ itemType: ObjectType.NOTE }))} />}</Show>
				<Show when={selectedEntities.bombs}>{(items) => <SelectionCount key="mines" num={items.length} label="bomb" onClick={() => dispatch(deselectAllObjectsOfType({ itemType: ObjectType.BOMB }))} />}</Show>
				<Show when={selectedEntities.obstacles}>{(items) => <SelectionCount key="obstacles" num={items.length} label="obstacle" onClick={() => dispatch(deselectAllObjectsOfType({ itemType: ObjectType.OBSTACLE }))} />}</Show>
			</ActionPanelGroup.ActionGroup>
			<Button variant="subtle" size="sm" unfocusOnPress onClick={() => dispatch(deselectAllEntities())}>
				Clear selection
			</Button>
			<ActionPanelGroup.ActionGroup gap="sm">
				<ActionPanelGroup.ActionGroup>
					<Tooltip render={() => "Mirror selection horizontally"}>
						<Button variant="ghost" size="icon" unfocusOnPress onClick={() => dispatch(mirrorSelection({ axis: "horizontal" }))}>
							<FlipHorizontal2Icon />
						</Button>
					</Tooltip>
					<Tooltip render={() => "Mirror selection vertically"}>
						<Button variant="ghost" size="icon" unfocusOnPress onClick={() => dispatch(mirrorSelection({ axis: "vertical" }))}>
							<FlipVertical2Icon />
						</Button>
					</Tooltip>
				</ActionPanelGroup.ActionGroup>
				<ActionPanelGroup.ActionGroup>
					<Tooltip render={() => "Nudge selection forwards"}>
						<Button variant="ghost" size="icon" unfocusOnPress onClick={() => dispatch(nudgeSelection({ direction: "forwards" }))}>
							<ArrowUpToLineIcon />
						</Button>
					</Tooltip>
					<Tooltip render={() => "Nudge selection backwards"}>
						<Button variant="ghost" size="icon" unfocusOnPress onClick={() => dispatch(nudgeSelection({ direction: "backwards" }))}>
							<ArrowDownToLineIcon />
						</Button>
					</Tooltip>
				</ActionPanelGroup.ActionGroup>
			</ActionPanelGroup.ActionGroup>
		</ActionPanelGroup.Root>
	);
}

export default SelectionActionPanelGroup;

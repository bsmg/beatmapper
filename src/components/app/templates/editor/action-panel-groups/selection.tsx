import { createListCollection } from "@ark-ui/react/collection";
import { useHotkey, useIsKeyPressed } from "@ark-ui/react/hotkeys";
import { useParams, useRouteContext } from "@tanstack/react-router";
import { type IWrapArc, type IWrapChain, NoteColor, NoteDirectionSchema, SliderMidAnchorMode, SliderMidAnchorModeSchema, sortObjectFn } from "bsmap";
import { ArrowDownToLineIcon, ArrowUpToLineIcon, EditIcon, FlipHorizontal2Icon, FlipVertical2Icon, TrashIcon } from "lucide-react";
import { type MouseEventHandler, useMemo } from "react";
import { gtValue, guard, integer, maxValue, minValue, nullable, number, object, pipe, union, values } from "valibot";

import { cleanObjectData, getDynamicInputValue, getHotkeyCategory, getHotkeyScopes } from "$/components/app/helpers";
import { ActionPanelGroup } from "$/components/app/layouts";
import { Show } from "$/components/ui/atoms";
import { Button, createPromptFactory, Tooltip, usePrompt } from "$/components/ui/compositions";
import { isColorNote } from "$/helpers/notes.helpers";
import { isObstacle } from "$/helpers/obstacles.helpers";
import { isArc, isChain } from "$/helpers/sliders.helpers";
import { deselectAllEntities, deselectAllObjectsOfType, mirrorAllSelectedObjects, nudgeSelection, removeAllSelectedObjects, updateAllSelectedObjects } from "$/store/actions";
import { selectSelectedObjects } from "$/store/features/objects.slice";
import { selectNoteGridSize, selectObstacleGridSize } from "$/store/features/selectors";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectActiveWindowSize, selectAllSelectedObjects, selectSnap } from "$/store/selectors";
import { ObjectType } from "$/types";
import { StrikethroughOnHover, Text } from "$:styled-system/jsx";

const NOTE_COLOR_COLLECTION = createListCollection({ items: [NoteColor.RED, NoteColor.BLUE], itemToValue: (x) => x.toString(), itemToString: (i) => ["Left", "Right"][i] });
const SLIDER_MID_ANCHOR_MODE_COLLECTION = createListCollection({ items: Object.values(SliderMidAnchorMode), itemToValue: (x) => x.toString(), itemToString: (i) => ["Straight", "Clockwise", "Counter-Clockwise"][i] });

const createModifyObjectsPrompt = createPromptFactory({
	title: "Modify All Selected Objects",
	description: "Any property fields left blank will preserve the original values set for each object.",
	validate: object({
		objectData: object({
			time: nullable(number()),
			posX: nullable(number()),
			posY: nullable(number()),
			laneRotation: nullable(number()),
		}),
		noteData: object({
			color: nullable(
				pipe(
					number(),
					values(NOTE_COLOR_COLLECTION.items),
					guard((_): _ is NoteColor => true), // hack: blame kival
				),
			),
			direction: nullable(union([NoteDirectionSchema, pipe(number(), minValue(1000), maxValue(1360)), pipe(number(), minValue(2000), maxValue(2360))])),
			angleOffset: nullable(pipe(number(), integer())),
		}),
		obstacleData: object({
			duration: nullable(number()),
			width: nullable(number()),
			height: nullable(number()),
		}),
		sliderData: object({
			color: nullable(
				pipe(
					number(),
					values(NOTE_COLOR_COLLECTION.items),
					guard((_): _ is NoteColor => true), // hack: blame kival
				),
			),
			direction: nullable(union([NoteDirectionSchema, pipe(number(), minValue(1000), maxValue(1360)), pipe(number(), minValue(2000), maxValue(2360))])),
			tailTime: nullable(number()),
			tailPosX: nullable(number()),
			tailPosY: nullable(number()),
			tailLaneRotation: nullable(number()),
		}),
		arcData: object({
			tailDirection: nullable(union([NoteDirectionSchema, pipe(number(), minValue(1000), maxValue(1360)), pipe(number(), minValue(2000), maxValue(2360))])),
			lengthMultiplier: nullable(number()),
			tailLengthMultiplier: nullable(number()),
			midAnchor: nullable(SliderMidAnchorModeSchema),
		}),
		chainData: object({
			sliceCount: nullable(pipe(number(), integer(), minValue(1))),
			squish: nullable(pipe(number(), gtValue(0))),
		}),
	}),
});

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
	const { sid } = useParams({ from: "/_/edit/$sid/$bid/_" });
	const { view } = useRouteContext({ from: "/_/edit/$sid/$bid/_" });

	const dispatch = useAppDispatch();
	const snapTo = useAppSelector(selectSnap);
	const noteGrid = useAppSelector((state) => selectNoteGridSize(state, sid));
	const obstacleGrid = useAppSelector((state) => selectObstacleGridSize(state, sid));
	const windowSize = useAppSelector((state) => selectActiveWindowSize(state, view));

	const objects = useAppSelector(selectAllSelectedObjects);
	const { notes, bombs, obstacles, arcs, chains } = useAppSelector(selectSelectedObjects);
	const sliders = useMemo(() => {
		let arr: Array<IWrapArc | IWrapChain> = [];
		if (arcs) arr = arr.concat(...arcs);
		if (chains) arr = arr.concat(...chains);
		return arr.sort(sortObjectFn);
	}, [arcs, chains]);

	const { trigger: triggerModify } = usePrompt(
		createModifyObjectsPrompt({
			defaultValues: {
				objectData: { time: getDynamicInputValue(objects, "time"), posX: getDynamicInputValue(objects, "posX"), posY: getDynamicInputValue(objects, "posY"), laneRotation: getDynamicInputValue(objects, "laneRotation") },
				noteData: { color: getDynamicInputValue(notes, "color"), direction: getDynamicInputValue(notes, "direction"), angleOffset: getDynamicInputValue(notes, "angleOffset") },
				obstacleData: { duration: getDynamicInputValue(obstacles, "duration"), width: getDynamicInputValue(obstacles, "width"), height: getDynamicInputValue(obstacles, "height") },
				sliderData: {
					color: getDynamicInputValue(sliders, "color"),
					direction: getDynamicInputValue(sliders, "direction"),
					tailTime: getDynamicInputValue(sliders, "tailTime"),
					tailPosX: getDynamicInputValue(sliders, "tailPosX"),
					tailPosY: getDynamicInputValue(sliders, "tailPosY"),
					tailLaneRotation: getDynamicInputValue(sliders, "tailLaneRotation"),
				},
				arcData: { tailDirection: getDynamicInputValue(arcs, "tailDirection"), lengthMultiplier: getDynamicInputValue(arcs, "lengthMultiplier"), tailLengthMultiplier: getDynamicInputValue(arcs, "tailLengthMultiplier"), midAnchor: getDynamicInputValue(arcs, "midAnchor") },
				chainData: { sliceCount: getDynamicInputValue(chains, "sliceCount"), squish: getDynamicInputValue(chains, "squish") },
			},
			render: ({ form }) => {
				return (
					<form.Root size="sm">
						<form.Row>
							<form.AppField name="objectData.time">{(ctx) => <ctx.NumberInput label="Time" placeholder="*" />}</form.AppField>
							<form.AppField name="objectData.posX">{(ctx) => <ctx.NumberInput label="Line Index" placeholder="*" />}</form.AppField>
							<form.AppField name="objectData.posY">{(ctx) => <ctx.NumberInput label="Line Layer" placeholder="*" />}</form.AppField>
						</form.Row>
						<Show when={objects.every(isColorNote)}>
							<form.Row>
								<form.AppField name="noteData.color">{(ctx) => <ctx.NumberCombobox label="Note Color" placeholder="*" collection={NOTE_COLOR_COLLECTION} clearable />}</form.AppField>
								<form.AppField name="noteData.direction">{(ctx) => <ctx.NumberInput label="Note Direction" placeholder="*" />}</form.AppField>
								<form.AppField name="noteData.angleOffset">{(ctx) => <ctx.NumberInput label="Angle Offset" placeholder="*" />}</form.AppField>
							</form.Row>
						</Show>
						<Show when={objects.every(isObstacle)}>
							<form.Row>
								<form.AppField name="obstacleData.duration">{(ctx) => <ctx.NumberInput label="Obstacle Duration" placeholder="*" />}</form.AppField>
								<form.AppField name="obstacleData.width">{(ctx) => <ctx.NumberInput label="Obstacle Width" placeholder="*" />}</form.AppField>
								<form.AppField name="obstacleData.height">{(ctx) => <ctx.NumberInput label="Obstacle Height" placeholder="*" />}</form.AppField>
							</form.Row>
						</Show>
						<Show when={objects.every(isArc)}>
							<form.Row>
								<form.AppField name="sliderData.color">{(ctx) => <ctx.NumberCombobox label="Arc Color" placeholder="*" collection={NOTE_COLOR_COLLECTION} clearable />}</form.AppField>
								<form.AppField name="sliderData.direction">{(ctx) => <ctx.NumberInput label="Head Direction" placeholder="*" />}</form.AppField>
								<form.AppField name="arcData.lengthMultiplier">{(ctx) => <ctx.NumberInput label="Head Length Multiplier" placeholder="*" />}</form.AppField>
							</form.Row>
							<form.Row>
								<form.AppField name="sliderData.tailTime">{(ctx) => <ctx.NumberInput label="Tail Time" placeholder="*" />}</form.AppField>
								<form.AppField name="sliderData.tailPosX">{(ctx) => <ctx.NumberInput label="Tail Line Index" placeholder="*" />}</form.AppField>
								<form.AppField name="sliderData.tailPosY">{(ctx) => <ctx.NumberInput label="Tail Line Layer" placeholder="*" />}</form.AppField>
							</form.Row>
							<form.Row>
								<form.AppField name="arcData.tailDirection">{(ctx) => <ctx.NumberInput label="Tail Direction" placeholder="*" />}</form.AppField>
								<form.AppField name="arcData.tailLengthMultiplier">{(ctx) => <ctx.NumberInput label="Tail Length Multiplier" placeholder="*" />}</form.AppField>
								<form.AppField name="arcData.midAnchor">{(ctx) => <ctx.NumberCombobox label="Mid-Anchor Mode" placeholder="*" collection={SLIDER_MID_ANCHOR_MODE_COLLECTION} clearable />}</form.AppField>
							</form.Row>
						</Show>
						<Show when={objects.every(isChain)}>
							<form.Row>
								<form.AppField name="sliderData.color">{(ctx) => <ctx.NumberCombobox label="Chain Color" placeholder="*" collection={NOTE_COLOR_COLLECTION} clearable />}</form.AppField>
								<form.AppField name="sliderData.direction">{(ctx) => <ctx.NumberInput label="Head Direction" placeholder="*" />}</form.AppField>
							</form.Row>
							<form.Row>
								<form.AppField name="sliderData.tailTime">{(ctx) => <ctx.NumberInput label="Tail Time" placeholder="*" />}</form.AppField>
								<form.AppField name="sliderData.tailPosX">{(ctx) => <ctx.NumberInput label="Tail Line Index" placeholder="*" />}</form.AppField>
								<form.AppField name="sliderData.tailPosY">{(ctx) => <ctx.NumberInput label="Tail Line Layer" placeholder="*" />}</form.AppField>
							</form.Row>
							<form.Row>
								<form.AppField name="chainData.sliceCount">{(ctx) => <ctx.NumberInput label="Slice Count" placeholder="*" />}</form.AppField>
								<form.AppField name="chainData.squish">{(ctx) => <ctx.NumberInput label="Squish Factor" placeholder="*" />}</form.AppField>
							</form.Row>
						</Show>
					</form.Root>
				);
			},
			onSubmit: ({ value: { objectData, noteData, obstacleData, sliderData, arcData, chainData } }) => {
				const objectChanges = cleanObjectData(objectData);
				const noteChanges = cleanObjectData(noteData);
				const obstacleChanges = cleanObjectData(obstacleData);
				const sliderChanges = cleanObjectData(sliderData);
				const arcChanges = cleanObjectData(arcData);
				const chainChanges = cleanObjectData(chainData);

				return dispatch(
					updateAllSelectedObjects({
						noteChanges: { ...objectChanges, ...noteChanges },
						bombChanges: { ...objectChanges },
						obstacleChanges: { ...objectChanges, ...obstacleChanges },
						arcChanges: { ...objectChanges, ...sliderChanges, ...arcChanges },
						chainChanges: { ...objectChanges, ...sliderChanges, ...chainChanges },
					}),
				);
			},
		}),
	);

	const scopes = useMemo(() => getHotkeyScopes(view), [view]);
	const category = useMemo(() => getHotkeyCategory(scopes), [scopes]);

	useHotkey({ scopes, category, label: "Mirror Selection Horizontally", hotkey: "Shift+H", action: () => dispatch(mirrorAllSelectedObjects({ axis: "horizontal", noteGrid, obstacleGrid })) });
	useHotkey({ scopes, category, label: "Mirror Selection Vertically", hotkey: "Shift+V", action: () => dispatch(mirrorAllSelectedObjects({ axis: "vertical", noteGrid, obstacleGrid })) });

	useHotkey({ scopes, category, label: "Nudge Selection Forwards", hotkey: "Shift+ArrowUp", action: () => dispatch(nudgeSelection({ direction: "forwards", amount: snapTo })) });
	useHotkey({ scopes, category, label: "Nudge Selection Backwards", hotkey: "Shift+ArrowDown", action: () => dispatch(nudgeSelection({ direction: "backwards", amount: snapTo })) });

	useHotkey({ scopes, category, label: "Nudge Selection to Next Window", hotkey: "Shift+PageUp", action: () => dispatch(nudgeSelection({ direction: "forwards", amount: windowSize })) });
	useHotkey({ scopes, category, label: "Nudge Selection to Previous Window", hotkey: "Shift+PageDown", action: () => dispatch(nudgeSelection({ direction: "backwards", amount: windowSize })) });

	useHotkey({ scopes, category, label: "Modify Selection", hotkey: "Mod+E", action: () => triggerModify() });
	useHotkey({ scopes, category, label: "Deselect All Objects", hotkey: "Escape", action: () => dispatch(deselectAllEntities()) });
	useHotkey({ scopes, category, label: "Delete Selection", hotkey: "Delete", action: () => dispatch(removeAllSelectedObjects()) });

	const isModKeyPressed = useIsKeyPressed({ hotkey: "Mod" });

	return (
		<ActionPanelGroup.Root label="Selection">
			<ActionPanelGroup.Section>
				<Show when={notes}>{(items) => <SelectionCount key="blocks" num={items.length} label="note" onClick={() => dispatch(deselectAllObjectsOfType({ itemType: ObjectType.NOTE }))} />}</Show>
				<Show when={bombs}>{(items) => <SelectionCount key="mines" num={items.length} label="bomb" onClick={() => dispatch(deselectAllObjectsOfType({ itemType: ObjectType.BOMB }))} />}</Show>
				<Show when={obstacles}>{(items) => <SelectionCount key="obstacles" num={items.length} label="obstacle" onClick={() => dispatch(deselectAllObjectsOfType({ itemType: ObjectType.OBSTACLE }))} />}</Show>
				<Show when={arcs}>{(items) => <SelectionCount key="arcs" num={items.length} label="arc" onClick={() => dispatch(deselectAllObjectsOfType({ itemType: ObjectType.ARC }))} />}</Show>
				<Show when={chains}>{(items) => <SelectionCount key="chains" num={items.length} label="chain" onClick={() => dispatch(deselectAllObjectsOfType({ itemType: ObjectType.CHAIN }))} />}</Show>
			</ActionPanelGroup.Section>
			<Button variant="subtle" size="sm" unfocusOnPress onClick={() => dispatch(deselectAllEntities())}>
				Clear Selection
			</Button>
			<ActionPanelGroup.Section gap="sm">
				<Tooltip render={() => "Mirror selection horizontally"}>
					<Button variant="ghost" size="icon" unfocusOnPress onClick={() => dispatch(mirrorAllSelectedObjects({ axis: "horizontal", noteGrid, obstacleGrid }))}>
						<FlipVertical2Icon />
					</Button>
				</Tooltip>
				<Tooltip render={() => "Nudge selection forwards"}>
					<Button variant="ghost" size="icon" unfocusOnPress onClick={() => dispatch(nudgeSelection({ direction: "forwards", amount: isModKeyPressed ? windowSize : snapTo }))}>
						<ArrowUpToLineIcon />
					</Button>
				</Tooltip>
				<Tooltip render={() => "Modify all selected objects"}>
					<Button variant="ghost" size="icon" unfocusOnPress onClick={triggerModify}>
						<EditIcon />
					</Button>
				</Tooltip>
				<Tooltip render={() => "Mirror selection vertically"}>
					<Button variant="ghost" size="icon" unfocusOnPress onClick={() => dispatch(mirrorAllSelectedObjects({ axis: "vertical", noteGrid, obstacleGrid }))}>
						<FlipHorizontal2Icon />
					</Button>
				</Tooltip>
				<Tooltip render={() => "Nudge selection backwards"}>
					<Button variant="ghost" size="icon" unfocusOnPress onClick={() => dispatch(nudgeSelection({ direction: "backwards", amount: isModKeyPressed ? windowSize : snapTo }))}>
						<ArrowDownToLineIcon />
					</Button>
				</Tooltip>
				<Tooltip render={() => "Delete all selected objects"}>
					<Button variant="ghost" size="icon" unfocusOnPress onClick={() => dispatch(removeAllSelectedObjects())}>
						<TrashIcon />
					</Button>
				</Tooltip>
			</ActionPanelGroup.Section>
		</ActionPanelGroup.Root>
	);
}

export default SelectionActionPanelGroup;

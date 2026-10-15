import { useHotkey } from "@ark-ui/react/hotkeys";
import { useRouteContext } from "@tanstack/react-router";
import { EventType } from "bsmap";
import { ArrowLeftToLineIcon, ArrowRightToLineIcon, EditIcon, FlipHorizontalIcon, TrashIcon } from "lucide-react";
import { useMemo } from "react";
import { boolean, integer, minValue, nullable, number, object, pipe, values } from "valibot";

import { cleanObjectData, getDynamicInputValue, getHotkeyCategory, getHotkeyScopes } from "$/components/app/helpers";
import { Show } from "$/components/ui/atoms";
import { Button, createPromptFactory, Field, Tooltip, usePrompt } from "$/components/ui/compositions";
import { isBasicEvent, isBoostEvent } from "$/helpers/events.helpers";
import { deselectAllEntities, mirrorAllSelectedEvents, nudgeSelection, removeAllSelectedEvents, updateAllSelectedEvents } from "$/store/actions";
import { selectSelectedEvents } from "$/store/features/events.slice";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectActiveWindowSize, selectAllSelectedEvents, selectSnap } from "$/store/selectors";
import { HStack } from "$:styled-system/jsx";

const createModifyEventsPrompt = createPromptFactory({
	title: "Modify All Selected Events",
	description: "Any property fields left blank will preserve the original values set for each event.",
	validate: object({
		eventData: object({
			time: nullable(number()),
		}),
		basicEventData: object({
			type: nullable(pipe(number(), values(Object.values(EventType)))),
			value: nullable(pipe(number(), integer(), minValue(0))),
			floatValue: nullable(pipe(number(), minValue(0))),
		}),
		boostEventData: object({
			toggle: nullable(boolean()),
		}),
	}),
});

function SelectionControls() {
	const { view } = useRouteContext({ from: "/_/edit/$sid/$bid/_/_scene/events" });

	const dispatch = useAppDispatch();
	const snapTo = useAppSelector(selectSnap);
	const windowSize = useAppSelector((state) => selectActiveWindowSize(state, view));

	const { basicEvents, boostEvents } = useAppSelector(selectSelectedEvents);
	const events = useAppSelector(selectAllSelectedEvents);

	const { trigger: triggerModify } = usePrompt(
		createModifyEventsPrompt({
			defaultValues: {
				eventData: { time: getDynamicInputValue(events, "time") },
				basicEventData: { type: getDynamicInputValue(basicEvents, "type"), value: getDynamicInputValue(basicEvents, "value"), floatValue: getDynamicInputValue(basicEvents, "floatValue") },
				boostEventData: { toggle: getDynamicInputValue(boostEvents, "toggle") },
			},
			render: ({ form }) => {
				return (
					<form.Root size="sm">
						<form.Row>
							<form.AppField name="eventData.time">{(ctx) => <ctx.NumberInput label="Time" placeholder="*" />}</form.AppField>
						</form.Row>
						<Show when={events.every(isBasicEvent)}>
							<form.Row>
								<form.AppField name="basicEventData.type">{(ctx) => <ctx.NumberInput label="Event Type" placeholder="*" />}</form.AppField>
								<form.AppField name="basicEventData.value">{(ctx) => <ctx.NumberInput label="Event Value" placeholder="*" />}</form.AppField>
								<form.AppField name="basicEventData.floatValue">{(ctx) => <ctx.NumberInput label="Event Float Value" placeholder="*" />}</form.AppField>
							</form.Row>
						</Show>
						<Show when={events.every(isBoostEvent)}>
							<form.Row>
								<form.AppField name="boostEventData.toggle">{(ctx) => <ctx.BooleanCombobox label="Toggle Color Boost" placeholder="*" clearable />}</form.AppField>
							</form.Row>
						</Show>
					</form.Root>
				);
			},
			onSubmit: ({ value: { eventData, basicEventData, boostEventData } }) => {
				const eventChanges = cleanObjectData(eventData);
				const basicEventChanges = cleanObjectData(basicEventData);
				const boostEventChanges = cleanObjectData(boostEventData);

				return dispatch(
					updateAllSelectedEvents({
						basicEventChanges: { ...eventChanges, ...basicEventChanges },
						boostEventChanges: { ...eventChanges, ...boostEventChanges },
					}),
				);
			},
		}),
	);

	const scopes = useMemo(() => getHotkeyScopes(view), [view]);
	const category = useMemo(() => getHotkeyCategory(scopes), [scopes]);

	useHotkey({ scopes, category, label: "Mirror Color for Selection", hotkey: "Shift+M", action: () => dispatch(mirrorAllSelectedEvents()) });

	useHotkey({ scopes, category, label: "Nudge Selection Forwards", hotkey: "Shift+ArrowUp", action: () => dispatch(nudgeSelection({ direction: "forwards", amount: snapTo })) });
	useHotkey({ scopes, category, label: "Nudge Selection Backwards", hotkey: "Shift+ArrowDown", action: () => dispatch(nudgeSelection({ direction: "backwards", amount: snapTo })) });

	useHotkey({ scopes, category, label: "Nudge Selection to Next Window", hotkey: "Shift+PageUp", action: () => dispatch(nudgeSelection({ direction: "forwards", amount: windowSize })) });
	useHotkey({ scopes, category, label: "Nudge Selection to Previous Window", hotkey: "Shift+PageDown", action: () => dispatch(nudgeSelection({ direction: "backwards", amount: windowSize })) });

	useHotkey({ scopes, category, label: "Modify All Selected Events", hotkey: "Mod+E", action: () => triggerModify() });
	useHotkey({ scopes, category, label: "Deselect All Objects", hotkey: "Escape", action: () => dispatch(deselectAllEntities()) });
	useHotkey({ scopes, category, label: "Delete Selection", hotkey: "Delete", action: () => dispatch(removeAllSelectedEvents()) });

	return (
		<Field cosmetic size="sm" label="Selection" align="end">
			<HStack>
				<Tooltip render={() => "Mirror color for selection"}>
					<Button variant="subtle" size="sm" unfocusOnPress onClick={() => dispatch(mirrorAllSelectedEvents())}>
						<FlipHorizontalIcon size={14} />
					</Button>
				</Tooltip>
				<Tooltip render={() => "Nudge selection backwards"}>
					<Button variant="subtle" size="sm" unfocusOnPress onClick={(ev) => dispatch(nudgeSelection({ direction: "backwards", amount: ev.altKey ? windowSize : snapTo }))}>
						<ArrowLeftToLineIcon size={14} />
					</Button>
				</Tooltip>
				<Tooltip render={() => "Nudge selection forwards"}>
					<Button variant="subtle" size="sm" unfocusOnPress onClick={(ev) => dispatch(nudgeSelection({ direction: "forwards", amount: ev.altKey ? windowSize : snapTo }))}>
						<ArrowRightToLineIcon size={14} />
					</Button>
				</Tooltip>
				<Tooltip render={() => "Modify all selected events"}>
					<Button variant="subtle" size="sm" unfocusOnPress onClick={triggerModify}>
						<EditIcon size={14} />
					</Button>
				</Tooltip>
				<Tooltip render={() => "Delete all selected events"}>
					<Button variant="subtle" size="sm" unfocusOnPress onClick={() => dispatch(removeAllSelectedEvents())}>
						<TrashIcon size={14} />
					</Button>
				</Tooltip>
			</HStack>
		</Field>
	);
}

export default SelectionControls;

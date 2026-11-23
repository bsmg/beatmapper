import type { Assign } from "@ark-ui/react";
import { useParams } from "@tanstack/react-router";
import { createNJSEvent, type IWrapNJSEvent } from "bsmap";
import { type ComponentProps, memo, useCallback, useMemo } from "react";

import { EventGrid } from "$/components/app/layouts";
import { For, Match, Switch } from "$/components/ui/atoms";
import { resolveEventId } from "$/helpers/events.helpers";
import { addNjsEvent, deselectNjsEvent, removeNjsEvent, selectNjsEvent, updateNjsEvent } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectAllNjsEvents, selectEnvironment, selectEventsEditorMirrorLock, selectEventsEditorStartAndEndBeat, selectEventsEditorTool, selectJumpSpeed } from "$/store/selectors";
import { type App, EventTool } from "$/types";
import { isColorDark, roundToNearest } from "$/utils";
import { token } from "$:styled-system/tokens";

const NjsEvent = memo(function NjsEvent({ data, actions }: { data: App.INJSEvent; actions: EventGrid.IPlacementActions<IWrapNJSEvent> }) {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const api = EventGrid.useContext();
	const baseJumpSpeed = useAppSelector((state) => selectJumpSpeed(state, sid, bid));

	const color = token("colors.gray.500");

	const resolveEventStyle = useCallback(
		(data: IWrapNJSEvent) => {
			const toWhite = `color-mix(in srgb, ${color}, white 30%)`;
			const toBlack = `color-mix(in srgb, ${color}, black 30%)`;

			const style = data.value === 0 ? `radial-gradient(${toBlack}, ${toWhite})` : `linear-gradient(90deg, ${data.value > 0 ? toBlack : toWhite}, ${data.value > 0 ? toWhite : toBlack})`;

			return { "--event-color": style, background: style, color: isColorDark(color) ? "white" : "black" };
		},
		[color],
	);

	return (
		<EventGrid.Event key={resolveEventId(data)} data={data} {...api.getEventProps(data, actions, resolveEventStyle(data))}>
			<Switch value={true} fallback={data.previous ? ">" : roundToNearest(baseJumpSpeed + data.value, 0.001)}>
				<Match when={(x) => !x}>{data.previous ? ">" : (data.value < 0 ? "-" : data.value > 0 ? "+" : "") + Math.abs(data.value).toString()}</Match>
			</Switch>
		</EventGrid.Event>
	);
});

interface Props {
	trackId: number;
}
function NjsEventTrack({ trackId, ...rest }: Assign<ComponentProps<typeof EventGrid.Track>, Props>) {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const dispatch = useAppDispatch();
	const selectedTool = useAppSelector(selectEventsEditorTool);
	const areLasersLocked = useAppSelector(selectEventsEditorMirrorLock);
	const { startBeat, endBeat } = useAppSelector((state) => selectEventsEditorStartAndEndBeat(state, sid));
	const environment = useAppSelector((state) => selectEnvironment(state, sid, bid));
	const njsEvents = useAppSelector((state) => selectAllNjsEvents(state));

	const visibleEvents = useMemo(() => njsEvents.filter((x) => x.time >= startBeat && x.time < endBeat), [njsEvents, startBeat, endBeat]);

	const api = EventGrid.useContext();

	const resolveEventData = useCallback((time: number) => createNJSEvent({ time, value: 0, previous: selectedTool === EventTool.TRANSITION ? 1 : undefined }), [selectedTool]);

	const actions = useMemo<EventGrid.IPlacementActions<IWrapNJSEvent>>(() => {
		return {
			selectId: resolveEventId,
			onCreate: resolveEventData,
			onPlace: (data) => dispatch(addNjsEvent({ data: data, environment, areLasersLocked })),
			onDelete: (_, id) => dispatch(removeNjsEvent({ id, environment, areLasersLocked })),
			onSelect: (_, id) => dispatch(selectNjsEvent({ id, environment, areLasersLocked })),
			onDeselect: (_, id) => dispatch(deselectNjsEvent({ id, environment, areLasersLocked })),
			onWheel: (data, id, delta) => {
				if (data.previous === 0) {
					const step = 1 / delta;
					return dispatch(updateNjsEvent({ id, environment, areLasersLocked, changes: { value: data.value + step } }));
				}
			},
		};
	}, [dispatch, resolveEventData, environment, areLasersLocked]);

	return (
		<EventGrid.Track {...api.getTrackProps(trackId, environment, actions)} {...rest}>
			<For each={visibleEvents}>{(data) => <NjsEvent data={data} actions={actions} />}</For>
		</EventGrid.Track>
	);
}

export default memo(NjsEventTrack);

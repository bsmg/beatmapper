import type { Assign } from "@ark-ui/react";
import { useParams } from "@tanstack/react-router";
import { createColorBoostEvent } from "bsmap";
import type { wrapper } from "bsmap/types";
import { type ComponentProps, useCallback, useMemo } from "react";

import { EventGrid } from "$/components/app/layouts";
import { For } from "$/components/ui/atoms";
import { resolveEventId } from "$/helpers/events.helpers";
import { addBoostEvent, bulkAddBoostEvent, bulkRemoveEvent, deselectEvent, removeEvent, selectEvent, updateBoostEvent } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectAllBoostEvents, selectEventEditorStartAndEndBeat, selectEventsEditorMirrorLock, selectEventTracksForEnvironment } from "$/store/selectors";
import type { App } from "$/types";
import { isColorDark } from "$/utils";
import { token } from "$:styled-system/tokens";

function BoostEvent({ data, actions }: { data: App.IBoostEvent; actions: EventGrid.IPlacementActions<wrapper.IWrapColorBoostEvent> }) {
	const api = EventGrid.useContext();

	const color = token("colors.pink.500");

	const resolveEventStyle = useCallback(
		(_: wrapper.IWrapColorBoostEvent) => {
			const toWhite = `color-mix(in srgb, ${color}, white 30%)`;
			const toBlack = `color-mix(in srgb, ${color}, black 30%)`;

			const style = `radial-gradient(${toBlack}, ${toWhite})`;

			return { "--event-color": style, background: style, color: isColorDark(color) ? "white" : "black" };
		},
		[color],
	);

	return (
		<EventGrid.Event key={resolveEventId(data)} data={data} {...api.getEventProps(data, actions, resolveEventStyle(data))}>
			{data.toggle ? "1" : "0"}
		</EventGrid.Event>
	);
}

interface Props {
	trackId: number;
}
function BoostEventTrack({ trackId, ...rest }: Assign<ComponentProps<typeof EventGrid.Track>, Props>) {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const dispatch = useAppDispatch();
	const areLasersLocked = useAppSelector(selectEventsEditorMirrorLock);
	const { startBeat, endBeat } = useAppSelector((state) => selectEventEditorStartAndEndBeat(state, sid));
	const tracks = useAppSelector((state) => selectEventTracksForEnvironment(state, sid, bid));
	const boostEvents = useAppSelector((state) => selectAllBoostEvents(state));

	const api = EventGrid.useContext();

	const resolveEventData = useCallback((time: number, norm: number) => createColorBoostEvent({ time, toggle: norm <= 0.5 }), []);

	const actions = useMemo<EventGrid.IPlacementActions<wrapper.IWrapColorBoostEvent>>(() => {
		return {
			onCreate: resolveEventData,
			onPlace: (data, isBulk) => dispatch((isBulk ? bulkAddBoostEvent : addBoostEvent)({ query: data, data: data, tracks, areLasersLocked })),
			onSelect: (data) => dispatch(selectEvent({ query: data, tracks, areLasersLocked })),
			onDeselect: (data) => dispatch(deselectEvent({ query: data, tracks, areLasersLocked })),
			onPick: () => {},
			onDelete: (data, isBulk) => dispatch((isBulk ? bulkRemoveEvent : removeEvent)({ query: data, tracks, areLasersLocked })),
			onWheel: (data, delta) => {
				return dispatch(updateBoostEvent({ query: data, tracks, areLasersLocked, changes: { toggle: delta > 0 } }));
			},
		};
	}, [dispatch, resolveEventData, tracks, areLasersLocked]);

	return (
		<EventGrid.Track {...api.getTrackProps(trackId, actions)} {...rest}>
			<For each={boostEvents.filter((x) => x.time >= startBeat && x.time < endBeat)}>{(data) => <BoostEvent data={data} actions={actions} />}</For>
		</EventGrid.Track>
	);
}

export default BoostEventTrack;

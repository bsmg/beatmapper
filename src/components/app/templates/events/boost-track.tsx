import type { Assign } from "@ark-ui/react";
import { useParams } from "@tanstack/react-router";
import { createColorBoostEvent, type IWrapColorBoostEvent } from "bsmap";
import { type ComponentProps, memo, useCallback, useMemo } from "react";

import { EventGrid } from "$/components/app/layouts";
import { For } from "$/components/ui/atoms";
import { resolveEventId } from "$/helpers/events.helpers";
import { addBoostEvent, bulkAddBoostEvent, bulkRemoveEvent, deselectEvent, removeEvent, selectEvent, updateBoostEvent } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectAllBoostEvents, selectEnvironment, selectEventEditorStartAndEndBeat, selectEventsEditorMirrorLock } from "$/store/selectors";
import type { App } from "$/types";
import { isColorDark } from "$/utils";
import { token } from "$:styled-system/tokens";

const BoostEvent = memo(function BoostEvent({ data, actions }: { data: App.IBoostEvent; actions: EventGrid.IPlacementActions<IWrapColorBoostEvent> }) {
	const api = EventGrid.useContext();

	const color = token("colors.pink.500");

	const resolveEventStyle = useCallback(
		(_: IWrapColorBoostEvent) => {
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
});

interface Props {
	trackId: number;
}
function BoostEventTrack({ trackId, ...rest }: Assign<ComponentProps<typeof EventGrid.Track>, Props>) {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const dispatch = useAppDispatch();
	const areLasersLocked = useAppSelector(selectEventsEditorMirrorLock);
	const { startBeat, endBeat } = useAppSelector((state) => selectEventEditorStartAndEndBeat(state, sid));
	const environment = useAppSelector((state) => selectEnvironment(state, sid, bid));
	const boostEvents = useAppSelector((state) => selectAllBoostEvents(state));

	const visibleEvents = useMemo(() => boostEvents.filter((x) => x.time >= startBeat && x.time < endBeat), [boostEvents, startBeat, endBeat]);

	const api = EventGrid.useContext();

	const resolveEventData = useCallback((time: number, norm: number) => createColorBoostEvent({ time, toggle: norm <= 0.5 }), []);

	const actions = useMemo<EventGrid.IPlacementActions<IWrapColorBoostEvent>>(() => {
		return {
			onCreate: resolveEventData,
			onPlace: (data, isBulk) => dispatch((isBulk ? bulkAddBoostEvent : addBoostEvent)({ query: data, data: data, environment, areLasersLocked })),
			onDelete: (data, isBulk) => dispatch((isBulk ? bulkRemoveEvent : removeEvent)({ query: data, environment, areLasersLocked })),
			onSelect: (data) => dispatch(selectEvent({ query: data, environment, areLasersLocked })),
			onDeselect: (data) => dispatch(deselectEvent({ query: data, environment, areLasersLocked })),
			onWheel: (data, delta) => dispatch(updateBoostEvent({ query: data, environment, areLasersLocked, changes: { toggle: delta > 0 } })),
		};
	}, [dispatch, resolveEventData, environment, areLasersLocked]);

	return (
		<EventGrid.Track {...api.getTrackProps(trackId, environment, actions)} {...rest}>
			<For each={visibleEvents}>{(data) => <BoostEvent data={data} actions={actions} />}</For>
		</EventGrid.Track>
	);
}

export default memo(BoostEventTrack);

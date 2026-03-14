import type { AnyFormApi } from "@tanstack/react-form";
import { useParams } from "@tanstack/react-router";
import { useMachine } from "@zag-js/react";
import { type ComponentProps, useCallback, useMemo, useState } from "react";
import { boolean, record, string } from "valibot";

import { EventGrid } from "$/components/app/layouts";
import { useMousePositionOverElement } from "$/components/hooks/use-mouse-position-over-element";
import { Button, usePrompt } from "$/components/ui/compositions";
import { deriveEventTracksForEnvironment, isMirroredTrack } from "$/helpers/events.helpers";
import { drawEventSelectionBox, jumpToBeat, updateEventsEditorCursor, updateEventsEditorTrackHeight } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import {
	selectCursorPositionInBeats,
	selectDurationInBeats,
	selectEditorOffsetInBeats,
	selectEnvironment,
	selectEventEditorStartAndEndBeat,
	selectEventsEditorCursor,
	selectEventsEditorEditMode,
	selectEventsEditorMirrorLock,
	selectEventsEditorTrackHeight,
	selectEventTracksForEnvironment,
	selectLoading,
	selectPacerWait,
	selectSnap,
} from "$/store/selectors";
import { type IEventTrack, type IEventTracks, TrackType } from "$/types";
import { clamp } from "$/utils";
import { Stack, Wrap } from "$:styled-system/jsx";
import BasicEventTrack from "./basic-track";
import BoostEventTrack from "./boost-track";

function EventGridEditor({ ...rest }: ComponentProps<typeof EventGrid.Root>) {
	const { sid, bid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const dispatch = useAppDispatch();
	const wait = useAppSelector(selectPacerWait);
	const isLoading = useAppSelector(selectLoading);
	const selectedEditMode = useAppSelector(selectEventsEditorEditMode);
	const snapTo = useAppSelector(selectSnap);
	const rowHeight = useAppSelector(selectEventsEditorTrackHeight);
	const areLasersLocked = useAppSelector(selectEventsEditorMirrorLock);
	const { startBeat, numOfBeatsToShow } = useAppSelector((state) => selectEventEditorStartAndEndBeat(state, sid));
	const tracks = useAppSelector((state) => selectEventTracksForEnvironment(state, sid, bid));
	const environment = useAppSelector((state) => selectEnvironment(state, sid, bid));
	const cursorPositionInBeats = useAppSelector((state) => selectCursorPositionInBeats(state, sid));
	const selectedBeat = useAppSelector((state) => {
		const selectedBeat = selectEventsEditorCursor(state);
		const offsetInBeats = -selectEditorOffsetInBeats(state, sid);
		const duration = selectDurationInBeats(state, sid);
		return selectedBeat !== null ? clamp(selectedBeat, offsetInBeats, (duration ?? selectedBeat) + offsetInBeats) : null;
	});

	const [filter, setFilter] = useState<string[]>(Object.keys(tracks));

	const filteredTracks = useMemo(
		() =>
			Object.entries(deriveEventTracksForEnvironment(environment)).reduce((acc: IEventTracks, [id, track]) => {
				if (!filter.includes(id)) return acc;
				acc[id] = track;
				return acc;
			}, {}),
		[filter, environment],
	);

	const service = useMachine(EventGrid.machine, {
		mode: selectedEditMode,
		loading: isLoading,
		snapTo,
		startBeat,
		numOfBeatsToShow,
		pointer: selectedBeat ?? undefined,
		trackHeight: rowHeight,
		onPointerChange: ({ beat: selectedBeat }) => {
			return dispatch(updateEventsEditorCursor({ selectedBeat }));
		},
		onTrackHeightChange: ({ height: newHeight }) => {
			return dispatch(updateEventsEditorTrackHeight({ newHeight }));
		},
		onSelectionCommit: ({ selectionBoxInBeats }) => {
			return dispatch(drawEventSelectionBox({ songId: sid, tracks: filteredTracks, selectionBoxInBeats: selectionBoxInBeats }));
		},
	});

	const api = EventGrid.connect(service);

	const [selectionBoxRef] = useMousePositionOverElement<HTMLDivElement>({
		debouncerOptions: { wait },
		onMouseMove: api.createTriggerMovementHandler(),
	});

	const isTrackDisabled = useCallback(
		(trackId: number) => {
			return areLasersLocked && isMirroredTrack(trackId, filteredTracks) ? true : undefined;
		},
		[areLasersLocked, filteredTracks],
	);

	const toggleFilterAll = useCallback(
		(form: AnyFormApi, filter = (_: IEventTrack) => true as boolean) => {
			const trackEntries = Object.entries(tracks);
			const isOnlyCategoryActive = trackEntries.every(([id, track]) => (filter(track) ? form.getFieldValue(id) : !form.getFieldValue(id)));

			for (const [id, track] of trackEntries) {
				const matches = filter(track);
				form.setFieldValue(id, matches ? !isOnlyCategoryActive : false);
			}
		},
		[tracks],
	);

	const { trigger: triggerTrackFilters } = usePrompt({
		title: "Track Visibility",
		description: "Toggle the visibility of basic event tracks within the editor.",
		validate: record(string(), boolean()),
		defaultValues: Object.keys(tracks).reduce((acc: { [key: keyof IEventTracks]: boolean }, id) => {
			acc[id] = filter.includes(id);
			return acc;
		}, {}),
		render: ({ form }) => (
			<Stack gap={2}>
				<Wrap gap={1} align={"center"}>
					<Button type="button" variant={"subtle"} size={"sm"} onClick={() => toggleFilterAll(form)}>
						All Tracks
					</Button>
					<Button type="button" variant={"subtle"} size={"sm"} onClick={() => toggleFilterAll(form, (x) => x.type === TrackType.LIGHT)}>
						Light Tracks
					</Button>
					<Button type="button" variant={"subtle"} size={"sm"} onClick={() => toggleFilterAll(form, (x) => x.type === TrackType.TRIGGER)}>
						Trigger Tracks
					</Button>
					<Button type="button" variant={"subtle"} size={"sm"} onClick={() => toggleFilterAll(form, (x) => x.type === TrackType.VALUE)}>
						Value Tracks
					</Button>
				</Wrap>
				<EventGrid.ForTracks tracks={tracks}>
					{(track, trackId) => {
						return <form.AppField name={trackId.toString()}>{(ctx) => <ctx.Checkbox checkboxLabel={track.label ?? `Track ${trackId}`} orientation={"horizontal"} />}</form.AppField>;
					}}
				</EventGrid.ForTracks>
			</Stack>
		),
		onSubmit: ({ value }) =>
			setFilter(
				Object.keys(value).reduce((acc: string[], id) => {
					if (value[id]) acc.push(id);
					return acc;
				}, []),
			),
	});

	return (
		<EventGrid.Root {...api.getRootProps()} {...rest} service={service}>
			<EventGrid.Header>
				<EventGrid.Actions>
					<Button variant={"subtle"} size={"sm"} onClick={triggerTrackFilters}>
						Track Visibility
					</Button>
				</EventGrid.Actions>
				<EventGrid.Timeline onScrubHeader={({ beat }) => dispatch(jumpToBeat({ songId: sid, value: beat }))} />
			</EventGrid.Header>
			<EventGrid.Body>
				<EventGrid.PrefixGroup onWheel={(ev) => ev.stopPropagation()}>
					<EventGrid.ForTracks tracks={filteredTracks}>
						{(track, id) => (
							<EventGrid.Prefix key={id} {...api.getPrefixProps()} data-highlighted={isTrackDisabled(id)}>
								{track.label}
							</EventGrid.Prefix>
						)}
					</EventGrid.ForTracks>
					<EventGrid.Prefix {...api.getPrefixProps()}>Color Boost</EventGrid.Prefix>
				</EventGrid.PrefixGroup>
				<EventGrid.Content {...api.getContentProps()} editMode={selectedEditMode}>
					<EventGrid.Markers />
					<EventGrid.Trigger ref={selectionBoxRef} {...api.getTriggerProps()}>
						<EventGrid.ForTracks tracks={filteredTracks}>{(_, id) => <BasicEventTrack key={id} trackId={id} data-highlighted={isTrackDisabled(id)} />}</EventGrid.ForTracks>
						<BoostEventTrack trackId={5} />
					</EventGrid.Trigger>
					<EventGrid.SelectionBox {...api.getSelectionBoxProps()} />
					<EventGrid.Cursor {...api.getCursorProps(cursorPositionInBeats)} />
					<EventGrid.Pointer {...api.getPointerProps()} />
				</EventGrid.Content>
			</EventGrid.Body>
		</EventGrid.Root>
	);
}

export default EventGridEditor;

import { useParams } from "@tanstack/react-router";
import { useMachine } from "@zag-js/react";
import { type ComponentProps, useCallback } from "react";

import { EventGrid } from "$/components/app/layouts";
import { useMousePositionOverElement } from "$/components/hooks/use-mouse-position-over-element";
import { isMirroredTrack } from "$/helpers/events.helpers";
import { drawEventSelectionBox, jumpToBeat, updateEventsEditorCursor, updateEventsEditorTrackHeight } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import {
	selectCursorPositionInBeats,
	selectDurationInBeats,
	selectEditorOffsetInBeats,
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
import { clamp } from "$/utils";
import BasicEventTrack from "./basic-track";

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
	const cursorPositionInBeats = useAppSelector((state) => selectCursorPositionInBeats(state, sid));
	const selectedBeat = useAppSelector((state) => {
		const selectedBeat = selectEventsEditorCursor(state);
		const offsetInBeats = -selectEditorOffsetInBeats(state, sid);
		const duration = selectDurationInBeats(state, sid);
		return selectedBeat !== null ? clamp(selectedBeat, offsetInBeats, (duration ?? selectedBeat) + offsetInBeats) : null;
	});

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
			return dispatch(drawEventSelectionBox({ songId: sid, tracks, selectionBoxInBeats: selectionBoxInBeats }));
		},
	});

	const api = EventGrid.connect(service);

	const [selectionBoxRef] = useMousePositionOverElement<HTMLDivElement>({
		debouncerOptions: { wait },
		onMouseMove: api.createTriggerMovementHandler(),
	});

	const isTrackDisabled = useCallback(
		(trackId: number) => {
			return areLasersLocked && isMirroredTrack(trackId, tracks) ? true : undefined;
		},
		[areLasersLocked, tracks],
	);

	return (
		<EventGrid.Root {...api.getRootProps()} {...rest} service={service}>
			<EventGrid.Header>
				<EventGrid.Actions />
				<EventGrid.Timeline onScrubHeader={({ beat }) => dispatch(jumpToBeat({ songId: sid, value: beat }))} />
			</EventGrid.Header>
			<EventGrid.Body>
				<EventGrid.PrefixGroup onWheel={(ev) => ev.stopPropagation()}>
					<EventGrid.ForTracks>
						{(track, id) => (
							<EventGrid.Prefix key={id} {...api.getPrefixProps()} data-highlighted={isTrackDisabled(id)}>
								{track.label}
							</EventGrid.Prefix>
						)}
					</EventGrid.ForTracks>
				</EventGrid.PrefixGroup>
				<EventGrid.Content {...api.getContentProps()} editMode={selectedEditMode}>
					<EventGrid.Markers />
					<EventGrid.Trigger ref={selectionBoxRef} {...api.getTriggerProps()}>
						<EventGrid.ForTracks>{(_, id) => <BasicEventTrack key={id} trackId={id} data-highlighted={isTrackDisabled(id)} />}</EventGrid.ForTracks>
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

import type { AnyFormApi } from "@tanstack/react-form";
import { useParams } from "@tanstack/react-router";
import { useMachine } from "@zag-js/react";
import type { IBasicTrack, ITrackDefinitions } from "bsmap";
import { type ComponentProps, memo, useCallback, useMemo, useState } from "react";
import { boolean, record, string } from "valibot";

import { EventGrid } from "$/components/app/layouts";
import { useMousePositionOverElement } from "$/components/hooks/use-mouse-position-over-element";
import { For, Show } from "$/components/ui/atoms";
import { Button, usePrompt } from "$/components/ui/compositions";
import { BasicTrackGroups } from "$/constants";
import { isLightTrack, isTrackGroupable, isTriggerTrack, isValueTrack, sortBasicTracks } from "$/helpers/events.helpers";
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
import { clamp, isObjectEmpty } from "$/utils";
import { Stack, Text, Wrap } from "$:styled-system/jsx";
import BasicEventTrack from "./basic-track";
import BoostEventTrack from "./boost-track";

function EventGridEditor({ ...rest }: Omit<ComponentProps<typeof EventGrid.Root>, "service">) {
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

	const allTracks = useMemo(() => {
		return Object.values(tracks).sort(sortBasicTracks(environment));
	}, [tracks, environment]);

	const [filter, setFilter] = useState<string[]>(Object.keys(tracks));

	const allFilteredTracks = useMemo<(IBasicTrack & { id: number; name?: string })[]>(() => {
		return allTracks.filter(({ id }) => filter.includes(id.toString()));
	}, [allTracks, filter]);

	const trackGroups = useMemo(() => ({ ...BasicTrackGroups[environment] }), [environment]);

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
			return dispatch(updateEventsEditorTrackHeight(newHeight));
		},
		onSelectionCommit: ({ selectionBoxInBeats }) => {
			const filteredTracks = allFilteredTracks.reduce((acc: ITrackDefinitions<{ id: number }>, track) => {
				acc[track.id] = track;
				return acc;
			}, {});
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
			return areLasersLocked && isTrackGroupable(trackId, environment) ? true : undefined;
		},
		[environment, areLasersLocked],
	);

	const handleFilterUpdate = useCallback(
		(form: AnyFormApi, filter = (_: IBasicTrack & { id: number }) => true as boolean) => {
			const trackEntries = Object.entries(tracks);
			const isOnlyCategoryActive = trackEntries.every(([id, track]) => (filter(track) ? form.getFieldValue(id) : !form.getFieldValue(id)));

			for (const [id, track] of trackEntries) {
				const matches = filter(track);
				form.setFieldValue(id, matches ? !isOnlyCategoryActive : false);
			}
		},
		[tracks],
	);

	const { trigger: triggerTrackVisibilityPrompt } = usePrompt({
		title: "Track Visibility",
		description: "Toggle the visibility of basic event tracks within the editor.",
		validate: record(string(), boolean()),
		defaultValues: Object.keys(tracks).reduce((acc: { [key: string]: boolean }, id) => {
			acc[id] = filter.includes(id);
			return acc;
		}, {}),
		render: ({ form }) => (
			<Stack gap={2}>
				<Wrap gap={1} align={"center"}>
					<Text textStyle="heading">Types: </Text>
					<Button type="button" variant={"subtle"} size={"sm"} onClick={() => handleFilterUpdate(form)}>
						All
					</Button>
					<Button type="button" variant={"subtle"} size={"sm"} onClick={() => handleFilterUpdate(form, (x) => isLightTrack(x.id, tracks))}>
						Light
					</Button>
					<Button type="button" variant={"subtle"} size={"sm"} onClick={() => handleFilterUpdate(form, (x) => isTriggerTrack(x.id, tracks))}>
						Trigger
					</Button>
					<Button type="button" variant={"subtle"} size={"sm"} onClick={() => handleFilterUpdate(form, (x) => isValueTrack(x.id, tracks))}>
						Value
					</Button>
				</Wrap>
				<Show when={!isObjectEmpty(trackGroups)}>
					<Wrap gap={1} align={"center"}>
						<Text textStyle="heading">Groups: </Text>
						<For each={Object.keys(trackGroups)}>
							{(group) => (
								<Button type="button" variant={"subtle"} size={"sm"} onClick={() => handleFilterUpdate(form, (x) => trackGroups[group].some((id) => x.id === id))}>
									{group}
								</Button>
							)}
						</For>
					</Wrap>
				</Show>
				<For each={allTracks}>
					{(track) => {
						return <form.AppField name={track.id.toString()}>{(ctx) => <ctx.Checkbox checkboxLabel={track.name} orientation={"horizontal"} />}</form.AppField>;
					}}
				</For>
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
					<Button variant={"subtle"} size={"sm"} onClick={triggerTrackVisibilityPrompt}>
						Track Visibility
					</Button>
				</EventGrid.Actions>
				<EventGrid.Timeline onScrubHeader={({ beat }) => dispatch(jumpToBeat({ songId: sid, value: beat }))} />
			</EventGrid.Header>
			<EventGrid.Body>
				<EventGrid.PrefixGroup onWheel={(ev) => ev.stopPropagation()}>
					<For each={allFilteredTracks}>
						{(track) => (
							<EventGrid.Prefix key={track.id} {...api.getPrefixProps(track.id, environment)} data-highlighted={isTrackDisabled(track.id)}>
								{track.name}
							</EventGrid.Prefix>
						)}
					</For>
					<EventGrid.Prefix {...api.getPrefixProps(5, environment)}>Color Boost</EventGrid.Prefix>
				</EventGrid.PrefixGroup>
				<EventGrid.Content {...api.getContentProps()} editMode={selectedEditMode}>
					<EventGrid.Markers />
					<EventGrid.Trigger ref={selectionBoxRef} {...api.getTriggerProps()}>
						<For each={allFilteredTracks}>{(track) => <BasicEventTrack key={track.id} trackId={track.id} data-highlighted={isTrackDisabled(track.id)} />}</For>
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

export default memo(EventGridEditor);

import { type PointerEventHandler, useCallback, useMemo } from "react";

import { deleteEvent } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectEventEditorStartAndEndBeat, selectEventEditorToggleMirror } from "$/store/selectors";
import type { App, SongId } from "$/types";
import { normalize } from "$/utils";
import { getYForSpeed } from "./speed-track.helpers";

import { styled } from "$:styled-system/jsx";

interface Props {
	sid: SongId;
	event: App.IBasicValueEvent;
	trackId: App.TrackId;
	parentWidth: number;
	parentHeight: number;
}
function SpeedTrackEvent({ sid, event, trackId, parentWidth, parentHeight }: Props) {
	const dispatch = useAppDispatch();
	const { startBeat, endBeat } = useAppSelector((state) => selectEventEditorStartAndEndBeat(state, sid));
	const areLasersLocked = useAppSelector(selectEventEditorToggleMirror);

	const x = useMemo(() => normalize(event.beatNum, startBeat, endBeat, 0, parentWidth), [event, startBeat, endBeat, parentWidth]);
	const y = useMemo(() => getYForSpeed(parentHeight, event.laserSpeed), [event, parentHeight]);

	const handlePointerDown = useCallback<PointerEventHandler>(
		(ev) => {
			if (ev.button === 2) {
				dispatch(deleteEvent({ beatNum: event.beatNum, trackId, areLasersLocked }));
			}
		},
		[dispatch, event, trackId, areLasersLocked],
	);

	return <Circle cx={x} cy={y} r={4} data-selected={event.selected} data-tentative={event.id === "tentative"} onPointerDown={handlePointerDown} />;
}

const Circle = styled("circle", {
	base: {
		colorPalette: { base: "green", _selected: "yellow" },
		fill: "colorPalette.500",
		cursor: "pointer",
		opacity: 1,
		"&[data-tentative=true]": {
			opacity: 0.5,
		},
	},
});

export default SpeedTrackEvent;

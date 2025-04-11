import { styled } from "$:styled-system/jsx";
import { deleteEvent } from "$/store/actions";
import { useAppDispatch } from "$/store/hooks";
import type { App } from "$/types";
import { normalize } from "$/utils";
import { getYForSpeed } from "./EventsGrid.helpers";

interface Props {
	event: App.IBasicValueEvent;
	trackId: App.TrackId;
	startBeat: number;
	endBeat: number;
	parentWidth: number;
	parentHeight: number;
	areLasersLocked: boolean;
}

const SpeedTrackEvent = ({ event, trackId, startBeat, endBeat, parentWidth, parentHeight, areLasersLocked }: Props) => {
	const dispatch = useAppDispatch();

	const x = normalize(event.beatNum, startBeat, endBeat, 0, parentWidth);
	const y = getYForSpeed(parentHeight, event.laserSpeed);

	return (
		<Circle
			cx={x}
			cy={y}
			r={4}
			data-selected={event.selected}
			data-tentative={event.id === "tentative"}
			onPointerDown={(ev) => {
				if (ev.button === 2) {
					dispatch(deleteEvent({ beatNum: event.beatNum, trackId, areLasersLocked }));
				}
			}}
		/>
	);
};

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

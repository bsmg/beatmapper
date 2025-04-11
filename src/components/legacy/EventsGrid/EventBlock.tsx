import { memo } from "react";

import { getColorForItem } from "$/helpers/colors.helpers";
import { isLightEvent } from "$/helpers/events.helpers";
import { bulkDeleteEvent, deleteEvent, deselectEvent, selectEvent, switchEventColor } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectActiveSongId, selectCustomColors, selectEventEditorEditMode } from "$/store/selectors";
import { App, EventEditMode } from "$/types";
import { normalize } from "$/utils";

import { styled } from "$:styled-system/jsx";
import { Button } from "$/components/ui/compositions";

const BLOCK_WIDTH = 7;

function getBackgroundForEvent(event: App.BasicEvent, customColors: App.ModSettings["customColors"]) {
	const color = getColorForItem(isLightEvent(event) ? (event.colorType ?? event.type) : event.type, customColors);
	const brightColor = `color-mix(in srgb, ${color}, white 30%)`;
	const semiTransparentColor = `color-mix(in srgb, ${color}, black 30%)`;

	switch (event.type) {
		case App.BasicEventType.ON: {
			// On/off are solid colors
			return color;
		}
		case App.BasicEventType.OFF:
		case App.BasicEventType.TRIGGER: {
			return `linear-gradient(90deg, ${semiTransparentColor}, ${brightColor}, ${semiTransparentColor})`;
		}
		case App.BasicEventType.FLASH: {
			return `linear-gradient(90deg, ${semiTransparentColor}, ${brightColor})`;
		}
		case App.BasicEventType.FADE: {
			return `linear-gradient(-90deg, ${semiTransparentColor}, ${brightColor})`;
		}
		case App.BasicEventType.TRANSITION: {
			return `linear-gradient(0deg, ${semiTransparentColor}, ${brightColor})`;
		}
		default: {
			throw new Error(`Unrecognized type: ${event.type}`);
		}
	}
}

interface Props {
	event: App.BasicEvent;
	trackWidth: number;
	startBeat: number;
	numOfBeatsToShow: number;
	deleteOnHover: boolean;
	areLasersLocked: boolean;
}

const EventBlock = ({ event, trackWidth, startBeat, numOfBeatsToShow, deleteOnHover, areLasersLocked }: Props) => {
	const songId = useAppSelector(selectActiveSongId);
	const customColors = useAppSelector((state) => selectCustomColors(state, songId));
	const selectedEditMode = useAppSelector(selectEventEditorEditMode);
	const dispatch = useAppDispatch();

	const offset = normalize(event.beatNum, startBeat, numOfBeatsToShow + startBeat, 0, trackWidth);

	const centeredOffset = offset - BLOCK_WIDTH / 2;

	const background = getBackgroundForEvent(event, customColors);

	return (
		<Wrapper
			style={{ transform: `translateX(${centeredOffset}px)`, background }}
			onClick={(ev) => ev.stopPropagation()}
			onContextMenu={(ev) => ev.preventDefault()}
			onPointerOver={() => {
				if (deleteOnHover) {
					dispatch(bulkDeleteEvent({ beatNum: event.beatNum, trackId: event.trackId, areLasersLocked }));
				}
			}}
			onPointerDown={(ev) => {
				// When in "select" mode, clicking the grid creates a selection box. We don't want to do that when the user clicks directly on a block.
				// In "place" mode, we need the event to propagate to enable bulk delete.
				if (selectedEditMode === EventEditMode.SELECT) {
					ev.stopPropagation();
				}

				const clickType = ev.button === 0 ? "left" : ev.button === 1 ? "middle" : ev.button === 2 ? "right" : undefined;

				if (clickType === "left") {
					const actionToSend = event.selected ? deselectEvent : selectEvent;
					dispatch(actionToSend({ beatNum: event.beatNum, trackId: event.trackId, areLasersLocked }));
				} else if (clickType === "middle") {
					dispatch(switchEventColor({ beatNum: event.beatNum, trackId: event.trackId, areLasersLocked }));
				} else if (clickType === "right") {
					dispatch(deleteEvent({ beatNum: event.beatNum, trackId: event.trackId, areLasersLocked }));
				}
			}}
		>
			{event.selected && <SelectedGlow />}
		</Wrapper>
	);
};

const Wrapper = styled(Button, {
	base: {
		width: "8px",
		height: "100%",
		position: "absolute",
		borderRadius: "full",
	},
});

const SelectedGlow = styled("div", {
	base: {
		position: "absolute",
		boxSize: "100%",
		inset: 0,
		zIndex: 1,
		colorPalette: "yellow",
		backgroundColor: "colorPalette.500",
		borderRadius: "full",
		opacity: 0.5,
	},
});

export default memo(EventBlock);

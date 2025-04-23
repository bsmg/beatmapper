import { type MouseEvent, memo, useCallback, useMemo } from "react";

import { getColorForItem } from "$/helpers/colors.helpers";
import { isLightEvent } from "$/helpers/events.helpers";
import { bulkDeleteEvent, deleteEvent, deselectEvent, selectEvent, switchEventColor } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectCustomColors, selectEventEditorEditMode, selectEventEditorStartAndEndBeat, selectEventEditorToggleMirror } from "$/store/selectors";
import { App, EventEditMode, type SongId } from "$/types";
import { normalize } from "$/utils";

import { styled } from "$:styled-system/jsx";
import { Button } from "$/components/ui/compositions";

const BLOCK_WIDTH = 8;

function resolveBackgroundForEvent(event: App.BasicEvent, customColors: App.ModSettings["customColors"]) {
	const color = getColorForItem(isLightEvent(event) ? (event.colorType ?? event.type) : event.type, customColors);
	const brightColor = `color-mix(in srgb, ${color}, white 30%)`;
	const semiTransparentColor = `color-mix(in srgb, ${color}, black 30%)`;

	switch (event.type) {
		case App.BasicEventType.ON: {
			return color;
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
			return `linear-gradient(90deg, ${semiTransparentColor}, ${brightColor}, ${semiTransparentColor})`;
		}
	}
}

interface Props {
	sid: SongId;
	event: App.BasicEvent;
	trackWidth: number;
	deleteOnHover: boolean;
}
function EventGridEventItem({ sid, event, trackWidth, deleteOnHover }: Props) {
	const dispatch = useAppDispatch();
	const { startBeat, endBeat } = useAppSelector((state) => selectEventEditorStartAndEndBeat(state, sid));
	const customColors = useAppSelector((state) => selectCustomColors(state, sid));
	const selectedEditMode = useAppSelector(selectEventEditorEditMode);
	const areLasersLocked = useAppSelector(selectEventEditorToggleMirror);

	const styles = useMemo(() => {
		const offset = normalize(event.beatNum, startBeat, endBeat, 0, trackWidth);
		const centeredOffset = offset - BLOCK_WIDTH / 2;

		const background = resolveBackgroundForEvent(event, customColors);

		return { transform: `translateX(${centeredOffset}px)`, background };
	}, [event, startBeat, endBeat, trackWidth, customColors]);

	const handlePointerDown = useCallback(
		(ev: MouseEvent<HTMLElement>) => {
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
		},
		[dispatch, event, selectedEditMode, areLasersLocked],
	);

	const handlePointerOver = useCallback(() => {
		if (deleteOnHover) {
			dispatch(bulkDeleteEvent({ beatNum: event.beatNum, trackId: event.trackId, areLasersLocked }));
		}
	}, [dispatch, event, deleteOnHover, areLasersLocked]);

	return (
		<Wrapper style={styles} onClick={(ev) => ev.stopPropagation()} onContextMenu={(ev) => ev.preventDefault()} onPointerOver={handlePointerOver} onPointerDown={handlePointerDown}>
			{"laserSpeed" in event && !!event.laserSpeed && <Value style={styles}>{event.laserSpeed}</Value>}
			{event.selected && <SelectedGlow />}
		</Wrapper>
	);
}

const Wrapper = styled(Button, {
	base: {
		width: "8px",
		height: "100%",
		position: "absolute",
		borderRadius: "full",
		zIndex: 1,
	},
});

const Value = styled("span", {
	base: {
		fontFamily: "monospace",
		paddingInline: 0.5,
		borderRadius: "sm",
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

export default memo(EventGridEventItem);

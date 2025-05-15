import { type MouseEvent, memo, useCallback, useMemo } from "react";

import { resolveColorForItem } from "$/helpers/colors.helpers";
import { isLightEvent, isValueEvent, resolveEventColor, resolveEventEffect } from "$/helpers/events.helpers";
import { bulkDeleteEvent, deleteEvent, deselectEvent, selectEvent, switchEventColor } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectColorScheme, selectEventEditorEditMode, selectEventEditorStartAndEndBeat, selectEventEditorToggleMirror } from "$/store/selectors";
import { App, type BeatmapId, EventEditMode, type SongId } from "$/types";
import { normalize } from "$/utils";

import { styled } from "$:styled-system/jsx";
import { Button } from "$/components/ui/compositions";

const BLOCK_WIDTH = 8;

function resolveBackgroundForEvent(event: App.IBasicEvent, options: Parameters<typeof resolveColorForItem>[1]) {
	const eventColor = resolveEventColor(event);
	const eventEffect = resolveEventEffect(event);

	const color = resolveColorForItem(isLightEvent(event) ? (eventColor ?? eventEffect) : eventEffect, options);
	const brightColor = `color-mix(in srgb, ${color}, white 30%)`;
	const semiTransparentColor = `color-mix(in srgb, ${color}, black 30%)`;

	switch (eventEffect) {
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
	bid: BeatmapId;
	event: App.IBasicEvent;
	trackWidth: number;
	deleteOnHover: boolean;
}
function EventGridEventItem({ sid, bid, event, trackWidth, deleteOnHover }: Props) {
	const dispatch = useAppDispatch();
	const { startBeat, endBeat } = useAppSelector((state) => selectEventEditorStartAndEndBeat(state, sid));
	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid, bid));
	const selectedEditMode = useAppSelector(selectEventEditorEditMode);
	const areLasersLocked = useAppSelector(selectEventEditorToggleMirror);

	const styles = useMemo(() => {
		const offset = normalize(event.time, startBeat, endBeat, 0, trackWidth);
		const centeredOffset = offset - BLOCK_WIDTH / 2;

		const background = resolveBackgroundForEvent(event, { customColors: colorScheme });

		return { transform: `translateX(${centeredOffset}px)`, background };
	}, [event, startBeat, endBeat, trackWidth, colorScheme]);

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
				dispatch(actionToSend({ beatNum: event.time, trackId: event.type, areLasersLocked }));
			} else if (clickType === "middle") {
				dispatch(switchEventColor({ beatNum: event.time, trackId: event.type, areLasersLocked }));
			} else if (clickType === "right") {
				dispatch(deleteEvent({ beatNum: event.time, trackId: event.type, areLasersLocked }));
			}
		},
		[dispatch, event, selectedEditMode, areLasersLocked],
	);

	const handlePointerOver = useCallback(() => {
		if (deleteOnHover) {
			dispatch(bulkDeleteEvent({ beatNum: event.time, trackId: event.type, areLasersLocked }));
		}
	}, [dispatch, event, deleteOnHover, areLasersLocked]);

	return (
		<Wrapper style={styles} onClick={(ev) => ev.stopPropagation()} onContextMenu={(ev) => ev.preventDefault()} onPointerOver={handlePointerOver} onPointerDown={handlePointerDown}>
			{isValueEvent(event) && <Value style={styles}>{event.value}</Value>}
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

import { memo, type PointerEvent, useCallback, useMemo } from "react";

import { useGlobalEventListener } from "$/components/hooks";
import { Button } from "$/components/ui/compositions";
import { resolveColorForItem } from "$/helpers/colors.helpers";
import { isLightEvent, isValueEvent, resolveEventColor, resolveEventEffect } from "$/helpers/events.helpers";
import { useAppSelector } from "$/store/hooks";
import { selectColorScheme, selectEventEditorStartAndEndBeat, selectEventTracksForEnvironment } from "$/store/selectors";
import { App, type BeatmapId, type IEventTracks, type SongId } from "$/types";
import { isColorDark, normalize } from "$/utils";
import { styled } from "$:styled-system/jsx";

const BLOCK_WIDTH = 8;

function resolveBackgroundForEvent(event: App.IBasicEvent, options: Parameters<typeof resolveColorForItem>[1] & { tracks?: IEventTracks }) {
	const eventColor = resolveEventColor(event);
	const eventEffect = resolveEventEffect(event, options.tracks);

	const color = resolveColorForItem(isLightEvent(event, options.tracks) ? (eventColor ?? eventEffect) : eventEffect, options);

	const brightColor = `color-mix(in srgb, ${color}, white 30%)`;
	const semiTransparentColor = `color-mix(in srgb, ${color}, black 30%)`;

	switch (eventEffect) {
		case App.BasicEventEffect.ON: {
			return { value: color, style: color };
		}
		case App.BasicEventEffect.FLASH: {
			return { value: color, style: `linear-gradient(90deg, ${semiTransparentColor}, ${brightColor})` };
		}
		case App.BasicEventEffect.FADE: {
			return { value: color, style: `linear-gradient(-90deg, ${semiTransparentColor}, ${brightColor})` };
		}
		case App.BasicEventEffect.TRANSITION: {
			return { value: color, style: `linear-gradient(0deg, ${semiTransparentColor}, ${brightColor})` };
		}
		default: {
			return { value: color, style: `linear-gradient(90deg, ${semiTransparentColor}, ${brightColor}, ${semiTransparentColor})` };
		}
	}
}

interface Props {
	sid: SongId;
	bid: BeatmapId;
	event: App.IBasicEvent;
	trackWidth: number;
	onEventPointerDown?: (event: PointerEvent, data: App.IBasicEvent) => void;
	onEventPointerUp?: (event: PointerEvent, data: App.IBasicEvent) => void;
	onEventPointerOver?: (event: PointerEvent, data: App.IBasicEvent) => void;
	onEventPointerOut?: (event: PointerEvent, data: App.IBasicEvent) => void;
	onEventWheel?: (event: WheelEvent, data: App.IBasicEvent) => void;
}
function EventGridEventItem({ sid, bid, event: data, trackWidth, onEventPointerDown, onEventPointerUp, onEventPointerOver, onEventPointerOut, onEventWheel }: Props) {
	const { startBeat, endBeat } = useAppSelector((state) => selectEventEditorStartAndEndBeat(state, sid));
	const tracks = useAppSelector((state) => selectEventTracksForEnvironment(state, sid, bid));
	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid, bid));

	const styles = useMemo(() => {
		const offset = normalize(data.time, startBeat, endBeat, 0, trackWidth);
		const centeredOffset = offset - BLOCK_WIDTH / 2;

		const background = resolveBackgroundForEvent(data, { tracks, customColors: colorScheme });

		return { transform: `translateX(${centeredOffset}px)`, background: background.style, color: isColorDark(background.value) ? "white" : "black" };
	}, [data, tracks, startBeat, endBeat, trackWidth, colorScheme]);

	const handlePointerDown = useCallback(
		(ev: PointerEvent<HTMLElement>) => {
			ev.preventDefault();
			if (onEventPointerDown) onEventPointerDown(ev, data);
		},
		[data, onEventPointerDown],
	);
	const handlePointerUp = useCallback(
		(ev: PointerEvent<HTMLElement>) => {
			ev.preventDefault();
			if (onEventPointerUp) onEventPointerUp(ev, data);
		},
		[data, onEventPointerUp],
	);
	const handlePointerOver = useCallback(
		(ev: PointerEvent<HTMLElement>) => {
			ev.preventDefault();
			if (onEventPointerOver) onEventPointerOver(ev, data);
		},
		[data, onEventPointerOver],
	);
	const handlePointerOut = useCallback(
		(ev: PointerEvent<HTMLElement>) => {
			ev.preventDefault();
			if (onEventPointerOut) onEventPointerOut(ev, data);
		},
		[data, onEventPointerOut],
	);
	const handleWheel = useCallback(
		(ev: WheelEvent) => {
			ev.preventDefault();
			if (onEventWheel) onEventWheel(ev, data);
		},
		[data, onEventWheel],
	);

	useGlobalEventListener("wheel", handleWheel, { options: { passive: false } });

	return (
		<Wrapper style={styles} onClick={(ev) => ev.stopPropagation()} onContextMenu={(ev) => ev.preventDefault()} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
			{isLightEvent(data, tracks) && <Value style={styles}>{data.value !== 0 ? data.floatValue : undefined}</Value>}
			{isValueEvent(data, tracks) && <Value style={styles}>{data.value}</Value>}
			{data.selected && <SelectedGlow />}
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
		fontWeight: "bold",
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

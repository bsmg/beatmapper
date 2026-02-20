import type { Assign } from "@ark-ui/react";
import { useParams } from "@tanstack/react-router";
import { type ComponentProps, type PointerEvent, useCallback, useMemo } from "react";

import { useGlobalEventListener } from "$/components/hooks/use-global-event-listener";
import { Button } from "$/components/ui/compositions";
import { useAppSelector } from "$/store/hooks";
import { selectEventEditorStartAndEndBeat } from "$/store/selectors";
import { normalize } from "$/utils";
import { styled } from "$:styled-system/jsx";

const BLOCK_WIDTH = 8;

interface Props<T> {
	event: T;
	trackWidth: number;
	onEventPointerDown?: (event: PointerEvent, data: T) => void;
	onEventPointerUp?: (event: PointerEvent, data: T) => void;
	onEventPointerOver?: (event: PointerEvent, data: T) => void;
	onEventPointerOut?: (event: PointerEvent, data: T) => void;
	onEventWheel?: (event: WheelEvent, data: T) => void;
}
function EventGridEventItem<T extends { time: number; selected?: boolean }>({ children, style, event: data, trackWidth, onEventPointerDown, onEventPointerUp, onEventPointerOver, onEventPointerOut, onEventWheel }: Assign<ComponentProps<typeof Wrapper>, Props<T>>) {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const { startBeat, endBeat } = useAppSelector((state) => selectEventEditorStartAndEndBeat(state, sid));

	const styles = useMemo(() => {
		const offset = normalize(data.time, startBeat, endBeat, 0, trackWidth);
		const centeredOffset = offset - BLOCK_WIDTH / 2;
		return { ...style, transform: `translateX(${centeredOffset}px)` };
	}, [data, style, startBeat, endBeat, trackWidth]);

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
		<Button as={Wrapper} style={styles} onClick={(ev) => ev.stopPropagation()} onContextMenu={(ev) => ev.preventDefault()} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
			{children && <Value style={styles}>{children}</Value>}
			{data.selected && <SelectedGlow />}
		</Button>
	);
}

const Wrapper = styled("div", {
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

export default EventGridEventItem;

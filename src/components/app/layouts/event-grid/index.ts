import { styled } from "$:styled-system/jsx";
import { center, hstack, stack } from "$:styled-system/patterns";

export { useEventGridContext as useContext } from "./context";
export { default as Event } from "./event";
export { default as ForTracks } from "./for";
export { connect, type EventGridSchema as Schema, type IEventPlacementActions as IPlacementActions, machine } from "./machine";
export { default as Markers } from "./markers";
export { default as Root } from "./root";
export { default as Timeline } from "./timeline";

export const Header = styled("div", {
	base: hstack.raw({
		position: "sticky",
		height: "32px",
		top: 0,
		gap: 0,
		backdropFilter: "blur(4px)",
		zIndex: 2,
	}),
});

export const Body = styled("div", {
	base: hstack.raw({
		gap: 0,
		backdropFilter: "blur(4px)",
	}),
});

export const Actions = styled("div", {
	base: center.raw({
		minWidth: "170px",
		height: "100%",
		borderBottomWidth: "sm",
		borderColor: "border.muted",
	}),
});

export const PrefixGroup = styled("div", {
	base: stack.raw({
		gap: 0,
	}),
});

export const Prefix = styled("div", {
	base: hstack.raw({
		width: "170px",
		justify: "flex-end",
		textAlign: "end",
		paddingInline: 1,
		position: "relative",
		backgroundColor: { base: undefined, _highlighted: "bg.subtle/50", _disabled: "bg.disabled" },
		borderBlockWidth: { base: "sm", _lastOfType: 0 },
		borderRightWidth: "md",
		borderColor: "border.muted",
		opacity: { base: 1, _disabled: "disabled" },
		cursor: { base: undefined, _disabled: "not-allowed" },
		overflowX: "auto",
		whiteSpace: "nowrap",
		textOverflow: "ellipsis",
		_scrollbar: { display: "none" },
	}),
});

export const Content = styled("div", {
	base: {
		position: "relative",
		flex: 1,
	},
	variants: {
		editMode: {
			place: { cursor: "pointer" },
			select: { cursor: "crosshair" },
		},
	},
});

export const Trigger = styled("div", {
	base: {
		position: "relative",
	},
});

export const Track = styled("div", {
	base: {
		position: "relative",
		backgroundColor: { base: undefined, _highlighted: "bg.subtle/50", _disabled: "bg.disabled" },
		borderBlockWidth: { base: "sm", _lastOfType: 0 },
		borderColor: "border.muted",
		opacity: { base: 1, _disabled: "disabled" },
		cursor: { base: undefined, _disabled: "not-allowed" },
	},
});

export const BackgroundBox = styled("div", {
	base: {
		position: "absolute",
		height: "100%",
		opacity: 0.2,
	},
});

export const SelectionBox = styled("div", {
	base: {
		position: "absolute",
		zIndex: 10,
		borderWidth: "md",
		borderStyle: "dashed",
		borderColor: "fg.default",
		pointerEvents: "none",
	},
});

export const Cursor = styled("div", {
	base: {
		position: "absolute",
		top: 0,
		width: "4px",
		height: "100%",
		colorPalette: "yellow",
		backgroundColor: "colorPalette.500",
		borderRadius: "full",
		pointerEvents: "none",
		transform: "translateX(-2px)",
		zIndex: 1,
	},
});

export const Pointer = styled("div", {
	base: {
		position: "absolute",
		top: 0,
		width: "3px",
		height: "100%",
		background: "fg.default",
		borderWidth: "sm",
		borderColor: "border.default",
		pointerEvents: "none",
		transform: "translateX(-2px)",
	},
});

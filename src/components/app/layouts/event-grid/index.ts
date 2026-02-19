import { styled } from "$:styled-system/jsx";
import { center, hstack, stack } from "$:styled-system/patterns";

export { default as BackgroundBox } from "./background-box";
export { default as Cursor } from "./cursor";
export { default as Event } from "./event";
export { default as ForTracks } from "./for";
export { default as Markers } from "./markers";
export { default as Pointer } from "./pointer";
export { default as Root } from "./root";
export { default as SelectionBox } from "./selection-box";
export { default as Timeline } from "./timeline";
export { default as Track } from "./track";

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
		backgroundColor: { base: undefined, _disabled: "bg.disabled" },
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

export const Control = styled("div", {
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

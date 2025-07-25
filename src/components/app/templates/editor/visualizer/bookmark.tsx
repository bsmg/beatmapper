import { type ComponentProps, Fragment, type MouseEvent, useState } from "react";

import type { App } from "$/types";
import { isColorDark } from "$/utils";

import { HStack, styled } from "$:styled-system/jsx";
import { Button } from "$/components/ui/compositions";

interface Props extends ComponentProps<typeof Button> {
	bookmark: App.IBookmark;
	offset: number;
	onMarkerClick: (event: MouseEvent<HTMLButtonElement>, beatNum: number) => void;
}
function EditorBookmark({ bookmark, offset, onMarkerClick, ...rest }: Props) {
	// We want to return two sibling pieces:
	// - A thin vertical line that shows where the flag lives in the beat, which ignores pointer events so that the waveform remains scrubbable
	// - The flag above the waveform, which displays the beatNum/name, and is clickable to jump the user to that moment in time.
	const sharedStyles = {
		left: `${offset}%`,
		color: isColorDark(bookmark.color) ? "white" : "black",
		backgroundColor: bookmark.color,
	};

	const [isHovering, setIsHovering] = useState(false);

	return (
		<Fragment>
			<ThinStrip style={sharedStyles} />
			<Flag
				{...rest}
				unfocusOnClick
				style={sharedStyles}
				onMouseEnter={() => setIsHovering(true)}
				onMouseLeave={() => setIsHovering(false)}
				onMouseUp={(ev) => onMarkerClick(ev, bookmark.time)}
				onContextMenu={(ev) => {
					// Don't allow context menu to pop on right click.
					ev.preventDefault();
				}}
			>
				<HStack gap={1}>
					<BeatNum>{bookmark.time} </BeatNum>
					<Name data-hover={isHovering ? "true" : undefined}>{bookmark.name}</Name>
				</HStack>
				<FlagDecoration viewBox="0 0 5 10">
					<polygon fill={bookmark.color} points="0,0 5,5 0,10" />
				</FlagDecoration>
			</Flag>
		</Fragment>
	);
}

const ThinStrip = styled("div", {
	base: {
		position: "absolute",
		zIndex: 2,
		insetBlockStart: -1,
		insetBlockEnd: -1,
		width: "2px",
		transform: "translateX(-1px)",
		borderRadius: "md",
		pointerEvents: "none",
	},
});

const Flag = styled(Button, {
	base: {
		position: "absolute",
		zIndex: 2,
		insetBlockStart: -1,
		paddingInline: "4px",
		height: "20px",
		lineHeight: "20px",
		display: "flex",
	},
});

const BeatNum = styled("span", {
	base: {
		fontSize: "11px",
		fontWeight: "bold",
	},
});

const FlagDecoration = styled("svg", {
	base: {
		position: "absolute",
		insetBlock: 0,
		insetInlineEnd: 0,
		transform: "translateX(100%)",
		height: "100%",
	},
});

const Name = styled("span", {
	base: {
		fontSize: "11px",
		display: { base: "none", _hover: "block" },
	},
});

export default EditorBookmark;

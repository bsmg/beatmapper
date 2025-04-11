import type { ISelectionBox } from "$/types";

import { styled } from "$:styled-system/jsx";

interface Props {
	box: ISelectionBox;
}

const SelectionBox = ({ box }: Props) => {
	const width = box.right - box.left;
	const height = box.bottom - box.top;

	return (
		<Box
			style={{
				width,
				height,
				top: box.top,
				left: box.left,
			}}
		/>
	);
};

const Box = styled("div", {
	base: {
		position: "absolute",
		zIndex: 10,
		borderWidth: "md",
		borderStyle: "dashed",
		borderColor: "fg.default",
		pointerEvents: "none",
	},
});

export default SelectionBox;

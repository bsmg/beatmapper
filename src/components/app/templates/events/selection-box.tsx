import { useMemo } from "react";

import { styled } from "$:styled-system/jsx";

interface Props {
	box: DOMRect;
}
function EventGridSelectionBox({ box }: Props) {
	const styles = useMemo(() => {
		const width = box.right - box.left;
		const height = box.bottom - box.top;
		return { width, height, top: box.top, left: box.left };
	}, [box]);

	return <Box style={styles} />;
}

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

export default EventGridSelectionBox;

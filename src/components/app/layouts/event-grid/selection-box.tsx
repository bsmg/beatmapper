import { useMemo } from "react";

import { styled } from "$:styled-system/jsx";

interface Props {
	box: DOMRect | null;
}
function EventGridSelectionBox({ box }: Props) {
	const styles = useMemo(() => {
		if (!box) return undefined;

		const width = box.right - box.left;
		const height = box.bottom - box.top;

		return { width, height, top: box.top, left: box.left };
	}, [box]);

	if (!box) return null;

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

import { useParams } from "@tanstack/react-router";
import { useMemo } from "react";

import { useAppSelector } from "$/store/hooks";
import { selectEventEditorStartAndEndBeat, selectEventsEditorCursor } from "$/store/selectors";
import { normalize } from "$/utils";
import { styled } from "$:styled-system/jsx";

interface Props {
	width: number;
}
function EventGridPointer({ width }: Props) {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const { startBeat, numOfBeatsToShow } = useAppSelector((state) => selectEventEditorStartAndEndBeat(state, sid));
	const selectedBeat = useAppSelector(selectEventsEditorCursor);

	const styles = useMemo(() => {
		const mousePositionInPx = selectedBeat !== null && selectedBeat - startBeat >= 0 ? normalize(selectedBeat - startBeat, 0, numOfBeatsToShow, 0, width) : 0;
		return { left: mousePositionInPx };
	}, [selectedBeat, startBeat, numOfBeatsToShow, width]);

	return <Wrapper style={styles} />;
}

const Wrapper = styled("div", {
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

export default EventGridPointer;

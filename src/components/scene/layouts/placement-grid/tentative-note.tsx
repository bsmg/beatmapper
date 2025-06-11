import { useContext, useMemo } from "react";

import { ColorNote } from "$/components/scene/compositions";
import { createColorNoteFromMouseEvent } from "$/helpers/notes.helpers";
import type { IGrid, ObjectPlacementMode } from "$/types";
import { resolvePositionForGridObject } from "../../helpers";
import { Context } from "./context";

interface Props {
	grid: IGrid;
	mode: ObjectPlacementMode;
	color: string;
}
function TentativeNote({ mode, grid: gridSize, color, ...rest }: Props) {
	const { cellDownAt, direction } = useContext(Context);

	const data = useMemo(() => {
		if (!cellDownAt || direction === null) return null;
		return {
			...createColorNoteFromMouseEvent(mode, cellDownAt, gridSize, direction),
			time: 0,
			tentative: true,
		};
	}, [mode, cellDownAt, gridSize, direction]);

	if (!data) return null;

	const position = resolvePositionForGridObject(data, {});

	return <ColorNote {...rest} position={position} data={data} color={color} />;
}

export default TentativeNote;

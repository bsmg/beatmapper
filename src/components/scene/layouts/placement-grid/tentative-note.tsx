import { useContext, useMemo } from "react";

import { ColorNote } from "$/components/scene/compositions";
import { resolvePositionForGridObject } from "$/components/scene/helpers";
import { createColorNoteFromMouseEvent } from "$/helpers/notes.helpers";
import type { IGrid, ObjectPlacementMode } from "$/types";
import { Context } from "./context";

interface Props {
	grid: IGrid;
	mode: ObjectPlacementMode;
	color: string;
}
function TentativeNote({ mode, grid, color, ...rest }: Props) {
	const { cellDownAt, direction } = useContext(Context);

	const data = useMemo(() => {
		if (!cellDownAt || direction === null) return null;
		return {
			...createColorNoteFromMouseEvent(mode, cellDownAt, grid, direction),
			tentative: true,
		};
	}, [mode, cellDownAt, grid, direction]);

	if (!data) return null;

	const position = resolvePositionForGridObject(data, {});

	return <ColorNote {...rest} position={position} data={data} color={color} />;
}

export default TentativeNote;

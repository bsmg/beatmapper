import { useContext, useMemo } from "react";

import { App } from "$/types";

import { ColorNote, resolvePositionForNote } from "$/components/scene/compositions";
import { Context } from "./context";

interface Props {
	direction: number;
	color: string;
}
function TentativeNote({ direction, color }: Props) {
	const { mouseDownAt } = useContext(Context);
	if (!mouseDownAt) return null;

	const data = useMemo(() => {
		return {
			beatNum: 0,
			colIndex: mouseDownAt.colIndex,
			rowIndex: mouseDownAt.rowIndex,
			direction: Object.values(App.CutDirection)[direction],
		};
	}, [mouseDownAt, direction]);

	const { x, y } = resolvePositionForNote(mouseDownAt);

	return <ColorNote position={[x, y, 0]} data={data} color={color} />;
}

export default TentativeNote;

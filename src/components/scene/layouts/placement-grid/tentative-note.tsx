import { createColorNote } from "bsmap";
import { useContext, useMemo } from "react";

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
		return createColorNote({
			posX: mouseDownAt.colIndex,
			posY: mouseDownAt.rowIndex,
			direction: direction,
		});
	}, [mouseDownAt, direction]);

	const { x, y } = resolvePositionForNote({ posX: mouseDownAt.colIndex, posY: mouseDownAt.rowIndex });

	return <ColorNote position={[x, y, 0]} data={data} color={color} />;
}

export default TentativeNote;

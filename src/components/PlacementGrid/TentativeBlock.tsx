import { BLOCK_COLUMN_WIDTH, SONG_OFFSET } from "$/constants";
import type { App, Direction } from "$/types";

import Block from "../Block";

const noop = () => {};

// TODO: Dedupe with SongBlocks.js
const getPositionForBlock = (colIndex: number, rowIndex: number) => {
	const x = colIndex * BLOCK_COLUMN_WIDTH - BLOCK_COLUMN_WIDTH * 1.5;
	const y = rowIndex * BLOCK_COLUMN_WIDTH - BLOCK_COLUMN_WIDTH;
	const z = -SONG_OFFSET;

	return { x, y, z };
};

interface Props {
	song: App.Song;
	direction: Direction;
	rowIndex: number;
	colIndex: number;
	color: string;
}

const TentativeBlock = ({ direction, rowIndex, colIndex, color }: Props) => {
	const { x, y, z } = getPositionForBlock(colIndex, rowIndex);

	return (
		<Block
			x={x}
			y={y}
			z={z}
			lineLayer={rowIndex}
			lineIndex={colIndex}
			direction={direction}
			color={color}
			isTransparent={false} // TODO: transparencyAmount?
			isSelected={false}
			selectionMode={null}
			handleClick={noop}
			handleStartSelecting={noop}
			handleMouseOver={noop}
		/>
	);
};

export default TentativeBlock;

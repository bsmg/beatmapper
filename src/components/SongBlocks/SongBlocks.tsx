import { Fragment, useEffect } from "react";

import { BLOCK_COLUMN_WIDTH, HIGHEST_PRECISION, SONG_OFFSET } from "$/constants";
import { getColorForItem } from "$/helpers/colors.helpers";
import { clickNote, finishManagingNoteSelection, mouseOverNote, startManagingNoteSelection } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { getBeatDepth, getCursorPositionInBeats, getNoteSelectionMode, getSelectedSong, getVisibleBombs, getVisibleNotes } from "$/store/selectors";
import { App, CutDirection, ObjectTool } from "$/types";
import { roundAwayFloatingPointNonsense } from "$/utils";

import Block from "../Block";
import Mine from "../Mine";

function getPositionForBlock<T extends App.IBaseNote>(note: T, beatDepth: number) {
	const x = note.colIndex * BLOCK_COLUMN_WIDTH - BLOCK_COLUMN_WIDTH * 1.5;
	const y = note.rowIndex * BLOCK_COLUMN_WIDTH - BLOCK_COLUMN_WIDTH;

	// We want to first lay the notes out with proper spacing between them.
	// beatDepth controls the distance between two 1/4 notes.
	// We want this to all be BPM-independent; two quarter notes should be equally distant regardless of BPM. To do this, we have to convert the note time into notes.
	// First, get the note's "starting" position. Where it is when the song is at 0:00
	const startingPosition = note.beatNum * beatDepth * -1;

	// Next, take into account that the song is playing. `cursorPosition` will continue to grow, and we need to cursorPosition it by the right number of beats.
	const z = startingPosition - SONG_OFFSET;

	return { x, y, z };
}

const SongBlocks = () => {
	const song = useAppSelector(getSelectedSong);
	const notes = useAppSelector(getVisibleNotes);
	const bombs = useAppSelector(getVisibleBombs);
	const cursorPositionInBeats = useAppSelector(getCursorPositionInBeats);
	const beatDepth = useAppSelector(getBeatDepth);
	const selectionMode = useAppSelector(getNoteSelectionMode);
	const dispatch = useAppDispatch();

	const zPosition = -SONG_OFFSET + (cursorPositionInBeats ?? 0) * beatDepth;

	// I can click on a block to start selecting it.
	// If I hold the mouse down, I can drag to select (or deselect) many notes at a time.
	// For this to work, I need to know when they start clicking and stop clicking.
	// For starting clicking, I can use the `SELECT_NOTE` action, triggered when clicking a block... but they might not be over a block when they release the mouse.
	// So instead I need to use a mouseUp handler up here.
	useEffect(() => {
		if (!selectionMode) {
			return;
		}

		const handleMouseUp = () => {
			// Wait 1 frame before wrapping up. This is to prevent the selection mode from changing before all event-handlers have been processed.
			// Without the delay, the user might accidentally add notes to the placement grid - further up in the React tree - if they release the mouse while over a grid tile.
			window.requestAnimationFrame(() => dispatch(finishManagingNoteSelection()));
		};

		window.addEventListener("mouseup", handleMouseUp);

		return () => window.removeEventListener("mouseup", handleMouseUp);
	}, [selectionMode, dispatch]);

	return (
		<Fragment>
			{notes.map((note) => {
				const { x, y, z } = getPositionForBlock(note, beatDepth);
				const noteZPosition = roundAwayFloatingPointNonsense(zPosition + z);
				// HACK: So I'm winding up with zPositions of like 11.999994, and it's making the notes transparent because they're 0.000006 before the placement grid.
				// I imagine there's a better place to manage this than here, but I'm sick of this problem.
				const adjustment = beatDepth * HIGHEST_PRECISION;
				const adjustedNoteZPosition = noteZPosition - adjustment;

				const color = Object.values(ObjectTool)[Object.values(App.SaberColor).indexOf(note.color)];
				const direction = Object.values(CutDirection)[Object.values(App.CutDirection).indexOf(note.direction)];

				return (
					<Block
						x={x}
						y={y}
						z={z}
						key={note.id}
						time={note.beatNum}
						lineLayer={note.rowIndex}
						lineIndex={note.colIndex}
						direction={direction}
						color={getColorForItem(color, song)}
						isTransparent={adjustedNoteZPosition > -SONG_OFFSET * 2}
						isSelected={note.selected}
						selectionMode={selectionMode}
						handleClick={(clickType, time, lineLayer, lineIndex) => dispatch(clickNote({ clickType, time, lineLayer, lineIndex }))}
						handleStartSelecting={(selectionMode) => dispatch(startManagingNoteSelection({ selectionMode }))}
						handleMouseOver={(time, lineLayer, lineIndex) => dispatch(mouseOverNote({ time, lineLayer, lineIndex }))}
					/>
				);
			})}
			{bombs.map((note) => {
				const { x, y, z } = getPositionForBlock(note, beatDepth);
				const noteZPosition = roundAwayFloatingPointNonsense(zPosition + z);
				// HACK: So I'm winding up with zPositions of like 11.999994, and it's making the notes transparent because they're 0.000006 before the placement grid.
				// I imagine there's a better place to manage this than here, but I'm sick of this problem.
				const adjustment = beatDepth * HIGHEST_PRECISION;
				const adjustedNoteZPosition = noteZPosition - adjustment;

				return (
					<Mine
						x={x}
						y={y}
						z={z}
						key={note.id}
						time={note.beatNum}
						lineLayer={note.rowIndex}
						lineIndex={note.colIndex}
						color={getColorForItem(ObjectTool.BOMB_NOTE, song)}
						isTransparent={adjustedNoteZPosition > -SONG_OFFSET * 2}
						isSelected={note.selected}
						selectionMode={selectionMode}
						handleClick={(clickType, time, lineLayer, lineIndex) => dispatch(clickNote({ clickType, time, lineLayer, lineIndex }))}
						handleStartSelecting={(selectionMode) => dispatch(startManagingNoteSelection({ selectionMode }))}
						handleMouseOver={(time, lineLayer, lineIndex) => dispatch(mouseOverNote({ time, lineLayer, lineIndex }))}
					/>
				);
			})}
		</Fragment>
	);
};

export default SongBlocks;

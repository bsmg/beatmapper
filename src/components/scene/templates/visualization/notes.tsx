import { Fragment, useMemo } from "react";

import { BombNote, ColorNote } from "$/components/scene/compositions";
import { SONG_OFFSET } from "$/components/scene/constants";
import { resolvePositionForGridObject } from "$/components/scene/helpers";
import { HIGHEST_PRECISION } from "$/constants";
import { resolveColorForItem } from "$/helpers/colors.helpers";
import { resolveNoteId } from "$/helpers/notes.helpers";
import { useAppSelector } from "$/store/hooks";
import { selectColorScheme, selectCursorPositionInBeats, selectVisibleBombs, selectVisibleNotes } from "$/store/selectors";
import { type App, type BeatmapId, ObjectTool, type SongId } from "$/types";

interface Props {
	sid: SongId;
	bid: BeatmapId;
	beatDepth: number;
	surfaceDepth: number;
	interactive?: boolean;
	handlePointerDown: (event: PointerEvent, data: App.IBaseNote) => void;
	handlePointerOver: (event: PointerEvent, data: App.IBaseNote) => void;
	handlePointerOut: (event: PointerEvent) => void;
	handleWheel: (event: WheelEvent, data: App.IBaseNote) => void;
}
function EditorNotes({ sid, bid, beatDepth, surfaceDepth, interactive, handlePointerDown, handlePointerOver, handlePointerOut, handleWheel }: Props) {
	const colorScheme = useAppSelector((state) => selectColorScheme(state, sid, bid));
	const notes = useAppSelector((state) => selectVisibleNotes(state, sid, { beatDepth, surfaceDepth, includeSpaceBeforeGrid: interactive }));
	const bombs = useAppSelector((state) => selectVisibleBombs(state, sid, { beatDepth, surfaceDepth, includeSpaceBeforeGrid: true }));
	const cursorPositionInBeats = useAppSelector((state) => selectCursorPositionInBeats(state, sid));

	const zPosition = useMemo(() => -SONG_OFFSET + (cursorPositionInBeats ?? 0) * beatDepth, [cursorPositionInBeats, beatDepth]);
	const adjustment = useMemo(() => beatDepth * HIGHEST_PRECISION, [beatDepth]);

	return (
		<Fragment>
			{notes.map((note) => {
				const position = resolvePositionForGridObject(note, { beatDepth });
				const noteZPosition = zPosition + position[2];
				const adjustedNoteZPosition = noteZPosition - adjustment;
				const color = Object.values(ObjectTool)[note.color];
				return (
					<ColorNote
						key={resolveNoteId(note)}
						layers={1}
						data={note}
						position={position}
						color={resolveColorForItem(color, { customColors: colorScheme })}
						transparent={adjustedNoteZPosition > -SONG_OFFSET * 2}
						onPointerDown={(e) => handlePointerDown(e.nativeEvent, note)}
						onPointerOver={(e) => handlePointerOver(e.nativeEvent, note)}
						onPointerOut={(e) => handlePointerOut(e.nativeEvent)}
						onWheel={(e) => handleWheel(e.nativeEvent, note)}
					/>
				);
			})}
			{bombs.map((note) => {
				const position = resolvePositionForGridObject(note, { beatDepth });
				const noteZPosition = zPosition + position[2];
				const adjustedNoteZPosition = noteZPosition - adjustment;
				return (
					<BombNote
						key={resolveNoteId(note)}
						layers={1}
						data={note}
						position={position}
						color={resolveColorForItem(ObjectTool.BOMB_NOTE, { customColors: colorScheme })}
						transparent={adjustedNoteZPosition > -SONG_OFFSET * 2}
						onPointerDown={(e) => handlePointerDown(e.nativeEvent, note)}
						onPointerOver={(e) => handlePointerOver(e.nativeEvent, note)}
						onPointerOut={(e) => handlePointerOut(e.nativeEvent)}
					/>
				);
			})}
		</Fragment>
	);
}

export default EditorNotes;

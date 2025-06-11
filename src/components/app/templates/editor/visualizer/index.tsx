import { type MouseEvent, useCallback, useDeferredValue } from "react";

import { useParentDimensions } from "$/components/hooks/use-parent-dimensions";
import { resolveBookmarkId } from "$/helpers/bookmarks.helpers";
import { jumpToBeat, removeBookmark, scrubVisualizer } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectAllBookmarks, selectCursorPosition, selectDuration, selectDurationInBeats, selectEditorOffsetInBeats, selectLoading, selectRenderScale, selectWaveformData } from "$/store/selectors";
import type { SongId } from "$/types";
import { roundToNearest } from "$/utils";

import { AudioVisualizer } from "$/components/app/layouts";
import { Waveform } from "$/components/ui/compositions";
import EditorBookmark from "./bookmark";

interface Props {
	sid: SongId;
}
function EditorAudioVisualizer({ sid }: Props) {
	const dispatch = useAppDispatch();
	const waveformData = useAppSelector(selectWaveformData);
	const isLoadingSong = useAppSelector(selectLoading);
	const duration = useAppSelector(selectDuration);
	const cursorPosition = useAppSelector(selectCursorPosition);
	const renderScale = useAppSelector(selectRenderScale);
	const bookmarks = useAppSelector(selectAllBookmarks);
	const durationInBeats = useAppSelector((state) => selectDurationInBeats(state, sid));
	const offsetInBeats = useAppSelector((state) => selectEditorOffsetInBeats(state, sid));
	const [dimensions, container] = useParentDimensions<HTMLDivElement>();

	// Updating this waveform is surprisingly expensive! We'll defer its rendered value and round the cursor position based on the render scale.
	const roundedCursorPosition = useDeferredValue(roundToNearest(cursorPosition, Math.min(1 / renderScale, 15) * 15));

	const handleVisualizerClick = useCallback(
		(_: MouseEvent<HTMLElement>, offset: number) => {
			dispatch(scrubVisualizer({ songId: sid, newOffset: offset }));
		},
		[dispatch, sid],
	);

	const handleMarkerClick = useCallback(
		(event: MouseEvent<HTMLButtonElement>, time: number) => {
			event.preventDefault();
			switch (event.button) {
				case 2: {
					return dispatch(removeBookmark({ beatNum: time }));
				}
				default: {
					return dispatch(jumpToBeat({ songId: sid, beatNum: time }));
				}
			}
		},
		[dispatch, sid],
	);

	return (
		<AudioVisualizer.Root ref={container} isLoading={isLoadingSong}>
			<AudioVisualizer.Content duration={duration} cursorPosition={roundedCursorPosition} onVisualizerClick={handleVisualizerClick}>
				{(ref) => <Waveform ref={ref} width={dimensions.width} height={dimensions.height} waveformData={waveformData} duration={duration} />}
			</AudioVisualizer.Content>
			{!isLoadingSong && durationInBeats && (
				<AudioVisualizer.Markers duration={durationInBeats} offset={offsetInBeats} markers={bookmarks} onMarkerClick={handleMarkerClick}>
					{(bookmark, rest) => <EditorBookmark key={resolveBookmarkId(bookmark)} bookmark={bookmark} {...rest} />}
				</AudioVisualizer.Markers>
			)}
		</AudioVisualizer.Root>
	);
}

export default EditorAudioVisualizer;

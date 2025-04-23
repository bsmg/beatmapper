import { type MouseEvent, useCallback } from "react";

import { deleteBookmark, jumpToBeat, scrubWaveform } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectAllBookmarks, selectCursorPosition, selectDuration, selectDurationInBeats, selectGraphicsQuality, selectIsLoading, selectOffsetInBeats, selectWaveformData } from "$/store/selectors";
import { Quality, type SongId } from "$/types";
import { roundToNearest } from "$/utils";

import { AudioVisualizer } from "$/components/app/layouts";
import { useParentDimensions } from "$/components/hooks/use-parent-dimensions";
import { Waveform } from "$/components/ui/compositions";
import EditorBookmark from "./bookmark";

interface Props {
	sid: SongId;
}
function EditorAudioVisualizer({ sid }: Props) {
	const dispatch = useAppDispatch();
	const waveformData = useAppSelector(selectWaveformData);
	const isLoadingSong = useAppSelector(selectIsLoading);
	const duration = useAppSelector(selectDuration);
	const cursorPosition = useAppSelector(selectCursorPosition);
	const graphicsLevel = useAppSelector(selectGraphicsQuality);
	const bookmarks = useAppSelector(selectAllBookmarks);
	const durationInBeats = useAppSelector((state) => selectDurationInBeats(state, sid));
	const offsetInBeats = useAppSelector((state) => selectOffsetInBeats(state, sid));
	const [dimensions, container] = useParentDimensions<HTMLDivElement>();

	// Updating this waveform is surprisingly expensive! We'll throttle its rendering by rounding the cursor position for lower graphics settings.
	// Because it's a pure component, providing the same cursorPosition means that the rendering will be skipped for equal values.
	let roundedCursorPosition: number;
	if (graphicsLevel === Quality.LOW) {
		roundedCursorPosition = roundToNearest(cursorPosition, 150);
	} else if (graphicsLevel === Quality.MEDIUM) {
		roundedCursorPosition = roundToNearest(cursorPosition, 75);
	} else {
		roundedCursorPosition = cursorPosition;
	}

	const handleVisualizerClick = useCallback(
		(_: MouseEvent<HTMLElement>, offset: number) => {
			dispatch(scrubWaveform({ newOffset: offset }));
		},
		[dispatch],
	);

	const handleMarkerClick = useCallback(
		(event: MouseEvent<HTMLButtonElement>, time: number) => {
			event.preventDefault();
			switch (event.button) {
				case 2: {
					return dispatch(deleteBookmark({ beatNum: time }));
				}
				default: {
					return dispatch(jumpToBeat({ beatNum: time }));
				}
			}
		},
		[dispatch],
	);

	return (
		<AudioVisualizer.Root ref={container} isLoading={isLoadingSong}>
			<AudioVisualizer.Content duration={duration} cursorPosition={roundedCursorPosition} onVisualizerClick={handleVisualizerClick}>
				{(ref) => <Waveform ref={ref} width={dimensions.width} height={dimensions.height} waveformData={waveformData} duration={duration} />}
			</AudioVisualizer.Content>
			{!isLoadingSong && durationInBeats && (
				<AudioVisualizer.Markers duration={durationInBeats} offset={offsetInBeats} markers={bookmarks} onMarkerClick={handleMarkerClick}>
					{(bookmark, rest) => <EditorBookmark key={bookmark.beatNum} bookmark={bookmark} {...rest} />}
				</AudioVisualizer.Markers>
			)}
		</AudioVisualizer.Root>
	);
}

export default EditorAudioVisualizer;

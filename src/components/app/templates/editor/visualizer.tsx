import { useParams } from "@tanstack/react-router";
import { type MouseEvent, useCallback } from "react";

import { AudioVisualizer } from "$/components/app/layouts";
import { useParentDimensions } from "$/components/hooks/use-parent-dimensions";
import { Waveform } from "$/components/ui/compositions";
import { resolveBookmarkId } from "$/helpers/bookmarks.helpers";
import { jumpToBeat, jumpToTime, removeBookmark } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { selectAllBookmarks, selectCursorPosition, selectDuration, selectEditorOffset, selectLoading, selectRenderScale, selectTimeProcessor, selectWaveformData } from "$/store/selectors";
import { roundToNearest } from "$/utils";

function EditorAudioVisualizer() {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const dispatch = useAppDispatch();
	const waveformData = useAppSelector(selectWaveformData);
	const isLoadingSong = useAppSelector(selectLoading);
	const duration = useAppSelector(selectDuration);
	const cursorPosition = useAppSelector(selectCursorPosition);
	const renderScale = useAppSelector(selectRenderScale);
	const bookmarks = useAppSelector(selectAllBookmarks);
	const timeProcessor = useAppSelector((state) => selectTimeProcessor(state, sid));
	const offset = useAppSelector((state) => selectEditorOffset(state, sid));

	const [container, dimensions] = useParentDimensions<HTMLDivElement>();

	const handleVisualizerClick = useCallback(
		(_: MouseEvent<HTMLElement>, offset: number) => {
			dispatch(jumpToTime({ songId: sid, value: offset }));
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
					return dispatch(jumpToBeat({ songId: sid, value: time }));
				}
			}
		},
		[dispatch, sid],
	);

	return (
		<AudioVisualizer.Root ref={container} isLoading={isLoadingSong}>
			<AudioVisualizer.Content duration={duration} cursorPosition={roundToNearest(cursorPosition, Math.min(1 / renderScale, 15) * 15)} onVisualizerClick={handleVisualizerClick}>
				{(ref) => <Waveform ref={ref} width={dimensions.width} height={dimensions.height} waveformData={waveformData} duration={duration} />}
			</AudioVisualizer.Content>
			{duration !== null && (
				<AudioVisualizer.Markers duration={duration} offset={offset} timeProcessor={timeProcessor} markers={bookmarks} onMarkerClick={handleMarkerClick}>
					{(bookmark, rest) => <AudioVisualizer.Bookmark key={resolveBookmarkId(bookmark)} bookmark={bookmark} {...rest} />}
				</AudioVisualizer.Markers>
			)}
		</AudioVisualizer.Root>
	);
}

export default EditorAudioVisualizer;

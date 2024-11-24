import { convertMillisecondsToBeats } from "$/helpers/audio.helpers";
import { deleteBookmark, jumpToBeat } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { getDurationInBeats, getSelectedSong, selectAllBookmarks } from "$/store/selectors";

import BookmarkFlag from "./BookmarkFlag";

const Bookmarks = () => {
	const bookmarks = useAppSelector(selectAllBookmarks);
	const durationInBeats = useAppSelector(getDurationInBeats);
	const offsetInBeats = useAppSelector((state) => {
		const selectedSong = getSelectedSong(state);
		return convertMillisecondsToBeats(selectedSong.offset, selectedSong.bpm);
	});
	const dispatch = useAppDispatch();

	if (!durationInBeats) return null;
	// Add the bookmarks in reverse.
	// This way, they stack from left to right, so earlier flags sit in front of later ones. This is important when hovering, to be able to see the flag name
	return [...bookmarks].reverse().map((bookmark) => {
		const beatNumWithOffset = bookmark.beatNum + offsetInBeats;
		const offsetPercentage = (beatNumWithOffset / durationInBeats) * 100;

		return <BookmarkFlag key={bookmark.beatNum} bookmark={bookmark} offsetPercentage={offsetPercentage} handleJump={() => dispatch(jumpToBeat({ beatNum: bookmark.beatNum }))} handleDelete={() => dispatch(deleteBookmark({ beatNum: bookmark.beatNum }))} />;
	});
};

export default Bookmarks;

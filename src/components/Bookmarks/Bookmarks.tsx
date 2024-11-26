import { deleteBookmark, jumpToBeat } from "$/store/actions";
import { useAppDispatch, useAppSelector } from "$/store/hooks";
import { getDurationInBeats, selectActiveSongId, selectAllBookmarks, selectOffsetInBeats } from "$/store/selectors";

import BookmarkFlag from "./BookmarkFlag";

const Bookmarks = () => {
	const songId = useAppSelector(selectActiveSongId);
	const bookmarks = useAppSelector(selectAllBookmarks);
	const durationInBeats = useAppSelector((state) => getDurationInBeats(state, songId));
	const offsetInBeats = useAppSelector((state) => selectOffsetInBeats(state, songId));
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

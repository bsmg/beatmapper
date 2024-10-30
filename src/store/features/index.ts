import { combineReducers } from "@reduxjs/toolkit";

import bookmarks from "./bookmarks.slice";
import clipboard from "./clipboard.slice";
import editor from "./editor";
import entities from "./entities";
import global from "./global.slice";
import navigation from "./navigation.slice";
import songs from "./songs.slice";
import user from "./user.slice";
import waveform from "./waveform.slice";

const reducer = combineReducers({
	songs: songs.reducer,
	clipboard: clipboard.reducer,
	editorEntities: entities.reducer,
	waveform: waveform.reducer,
	navigation: navigation.reducer,
	editor: editor.reducer,
	global: global.reducer,
	user: user.reducer,
	bookmarks: bookmarks.reducer,
});

export default {
	reducer,
};

import { combineReducers } from "@reduxjs/toolkit";

import clipboard from "./clipboard.slice";
import editor from "./editor";
import entities from "./entities";
import global from "./global.slice";
import navigation from "./navigation.slice";
import songs from "./songs.slice";
import user from "./user.slice";
import waveform from "./visualizer.slice";

const reducer = combineReducers({
	songs: songs.reducer,
	clipboard: clipboard.reducer,
	entities: entities.reducer,
	waveform: waveform.reducer,
	navigation: navigation.reducer,
	editor: editor.reducer,
	global: global.reducer,
	user: user.reducer,
});

export default {
	reducer,
};

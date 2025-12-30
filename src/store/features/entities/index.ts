import { combineReducers } from "@reduxjs/toolkit";

import beatmap from "./beatmap";
import editor from "./editor";
import lightshow from "./lightshow";

const reducer = combineReducers({
	beatmap: beatmap.reducer,
	lightshow: lightshow.reducer,
	editor: editor.reducer,
});

export default { reducer };

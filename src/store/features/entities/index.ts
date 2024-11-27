import { combineReducers } from "@reduxjs/toolkit";

import active from "./active.slice";
import beatmap from "./beatmap";
import editor from "./editor";
import lightshow from "./lightshow";

const reducer = combineReducers({
	active: active.reducer,
	beatmap: beatmap.reducer,
	lightshow: lightshow.reducer,
	editor: editor.reducer,
});

export default { reducer };

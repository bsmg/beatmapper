import { combineReducers } from "@reduxjs/toolkit";

import active from "./active.slice";
import beatmap from "./beatmap";
import lightshow from "./lightshow";

const reducer = combineReducers({
	active: active.reducer,
	beatmap: beatmap.reducer,
	lightshow: lightshow.reducer,
});

export default { reducer };

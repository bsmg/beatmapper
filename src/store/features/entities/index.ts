import { combineReducers } from "@reduxjs/toolkit";

import beatmap from "./beatmap";
import difficulty from "./difficulty.slice";
import lightshow from "./lightshow";

const reducer = combineReducers({
	difficulty: difficulty.reducer,
	beatmap: beatmap.reducer,
	lightshow: lightshow.reducer,
});

export default { reducer };

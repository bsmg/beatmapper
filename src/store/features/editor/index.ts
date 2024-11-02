import { combineReducers } from "@reduxjs/toolkit";

import beatmap from "./beatmap.slice";
import lightshow from "./lightshow.slice";

const reducer = combineReducers({
	notes: beatmap.reducer,
	events: lightshow.reducer,
});

export default {
	reducer: reducer,
};

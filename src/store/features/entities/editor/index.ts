import { combineReducers } from "@reduxjs/toolkit";

import bookmarks from "./bookmarks.slice";

const reducer = combineReducers({
	bookmarks: bookmarks.reducer,
});

export default { reducer };

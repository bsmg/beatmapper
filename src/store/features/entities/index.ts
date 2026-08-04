import { combineReducers } from "@reduxjs/toolkit";

import editor from "./editor";
import events from "./events.slice";
import objects from "./objects.slice";

const reducer = combineReducers({
	beatmap: objects.reducer,
	lightshow: events.reducer,
	editor: editor.reducer,
});

export default { reducer };

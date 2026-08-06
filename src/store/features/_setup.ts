import { combineSlices } from "@reduxjs/toolkit";

import beatmap from "./beatmap.slice";
import bookmarks from "./bookmarks.slice";
import clipboard from "./clipboard.slice";
import events from "./events.slice";
import global from "./global.slice";
import lightshow from "./lightshow.slice";
import navigation from "./navigation.slice";
import objects from "./objects.slice";
import songs from "./songs.slice";
import timeline from "./timeline.slice";
import user from "./user.slice";
import visualizer from "./visualizer.slice";

export default combineSlices(global, user, navigation, visualizer, beatmap, lightshow, songs, timeline, objects, events, bookmarks, clipboard);

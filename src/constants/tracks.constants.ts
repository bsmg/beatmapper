import { renamer } from "bsmap/extensions";

import { App, type IEventTrack, TrackType } from "$/types";

export const EVENT_TRACKS: IEventTrack[] = [
	{ id: App.TrackId[0], label: renamer.genericTypeMap[0], type: TrackType.LIGHT },
	{ id: App.TrackId[1], label: renamer.genericTypeMap[1], type: TrackType.LIGHT },
	{ id: App.TrackId[2], label: renamer.genericTypeMap[2], type: TrackType.LIGHT, side: "left" },
	{ id: App.TrackId[3], label: renamer.genericTypeMap[3], type: TrackType.LIGHT, side: "right" },
	{ id: App.TrackId[4], label: renamer.genericTypeMap[4], type: TrackType.LIGHT },
	{ id: App.TrackId[5], label: renamer.genericTypeMap[5], type: TrackType.UNSUPPORTED },
	{ id: App.TrackId[6], label: renamer.genericTypeMap[6], type: TrackType.LIGHT, side: "left" },
	{ id: App.TrackId[7], label: renamer.genericTypeMap[7], type: TrackType.LIGHT, side: "right" },
	{ id: App.TrackId[8], label: renamer.genericTypeMap[8], type: TrackType.TRIGGER },
	{ id: App.TrackId[9], label: renamer.genericTypeMap[9], type: TrackType.TRIGGER },
	{ id: App.TrackId[10], label: renamer.genericTypeMap[10], type: TrackType.LIGHT, side: "left" },
	{ id: App.TrackId[11], label: renamer.genericTypeMap[11], type: TrackType.LIGHT, side: "right" },
	{ id: App.TrackId[12], label: renamer.genericTypeMap[12], type: TrackType.VALUE, side: "left" },
	{ id: App.TrackId[13], label: renamer.genericTypeMap[13], type: TrackType.VALUE, side: "right" },
	{ id: App.TrackId[14], label: renamer.genericTypeMap[14], type: TrackType.UNSUPPORTED },
	{ id: App.TrackId[15], label: renamer.genericTypeMap[15], type: TrackType.UNSUPPORTED },
	{ id: App.TrackId[16], label: renamer.genericTypeMap[16], type: TrackType.VALUE },
	{ id: App.TrackId[17], label: renamer.genericTypeMap[17], type: TrackType.VALUE },
	{ id: App.TrackId[18], label: renamer.genericTypeMap[18], type: TrackType.VALUE },
	{ id: App.TrackId[19], label: renamer.genericTypeMap[19], type: TrackType.VALUE },
	{ id: App.TrackId[40], label: renamer.genericTypeMap[40], type: TrackType.VALUE },
	{ id: App.TrackId[41], label: renamer.genericTypeMap[41], type: TrackType.VALUE },
	{ id: App.TrackId[42], label: renamer.genericTypeMap[42], type: TrackType.VALUE },
	{ id: App.TrackId[43], label: renamer.genericTypeMap[43], type: TrackType.VALUE },
	{ id: App.TrackId[100], label: renamer.genericTypeMap[100], type: TrackType.UNSUPPORTED },
	{ id: App.TrackId[1000], label: renamer.genericTypeMap[1000], type: TrackType.UNSUPPORTED },
] as const;

export const COMMON_EVENT_TRACKS = EVENT_TRACKS.filter(({ id }) => {
	const index = Object.keys(App.TrackId)[Object.values(App.TrackId).indexOf(id)];
	return [0, 1, 2, 3, 4, 8, 9, 12, 13].includes(Number(index));
});

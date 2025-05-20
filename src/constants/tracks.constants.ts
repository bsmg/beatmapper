import { renamer } from "bsmap/extensions";

import { App, type IEventTrack, TrackType } from "$/types";

export const EVENT_TRACKS = {
	0: { id: App.TrackId[0], label: renamer.genericTypeMap[0], type: TrackType.LIGHT },
	1: { id: App.TrackId[1], label: renamer.genericTypeMap[1], type: TrackType.LIGHT },
	2: { id: App.TrackId[2], label: renamer.genericTypeMap[2], type: TrackType.LIGHT, side: "left" },
	3: { id: App.TrackId[3], label: renamer.genericTypeMap[3], type: TrackType.LIGHT, side: "right" },
	4: { id: App.TrackId[4], label: renamer.genericTypeMap[4], type: TrackType.LIGHT },
	5: { id: App.TrackId[5], label: renamer.genericTypeMap[5], type: TrackType.UNSUPPORTED },
	6: { id: App.TrackId[6], label: renamer.genericTypeMap[6], type: TrackType.LIGHT, side: "left" },
	7: { id: App.TrackId[7], label: renamer.genericTypeMap[7], type: TrackType.LIGHT, side: "right" },
	8: { id: App.TrackId[8], label: renamer.genericTypeMap[8], type: TrackType.TRIGGER },
	9: { id: App.TrackId[9], label: renamer.genericTypeMap[9], type: TrackType.TRIGGER },
	10: { id: App.TrackId[10], label: renamer.genericTypeMap[10], type: TrackType.LIGHT, side: "left" },
	11: { id: App.TrackId[11], label: renamer.genericTypeMap[11], type: TrackType.LIGHT, side: "right" },
	12: { id: App.TrackId[12], label: renamer.genericTypeMap[12], type: TrackType.VALUE, side: "left" },
	13: { id: App.TrackId[13], label: renamer.genericTypeMap[13], type: TrackType.VALUE, side: "right" },
	14: { id: App.TrackId[14], label: renamer.genericTypeMap[14], type: TrackType.UNSUPPORTED },
	15: { id: App.TrackId[15], label: renamer.genericTypeMap[15], type: TrackType.UNSUPPORTED },
	16: { id: App.TrackId[16], label: renamer.genericTypeMap[16], type: TrackType.VALUE },
	17: { id: App.TrackId[17], label: renamer.genericTypeMap[17], type: TrackType.VALUE },
	18: { id: App.TrackId[18], label: renamer.genericTypeMap[18], type: TrackType.VALUE },
	19: { id: App.TrackId[19], label: renamer.genericTypeMap[19], type: TrackType.VALUE },
	40: { id: App.TrackId[40], label: renamer.genericTypeMap[40], type: TrackType.VALUE },
	41: { id: App.TrackId[41], label: renamer.genericTypeMap[41], type: TrackType.VALUE },
	42: { id: App.TrackId[42], label: renamer.genericTypeMap[42], type: TrackType.VALUE },
	43: { id: App.TrackId[43], label: renamer.genericTypeMap[43], type: TrackType.VALUE },
	100: { id: App.TrackId[100], label: renamer.genericTypeMap[100], type: TrackType.UNSUPPORTED },
	1000: { id: App.TrackId[1000], label: renamer.genericTypeMap[1000], type: TrackType.UNSUPPORTED },
} as const satisfies Record<number, IEventTrack>;

export const ALL_EVENT_TRACKS = Object.values(EVENT_TRACKS) as IEventTrack[];

export const SUPPORTED_EVENT_TRACKS = ALL_EVENT_TRACKS.filter(({ id }) => {
	return [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 16, 17, 18, 19].includes(id);
});

export const COMMON_EVENT_TRACKS = SUPPORTED_EVENT_TRACKS.filter(({ id }) => {
	return [0, 1, 2, 3, 4, 8, 9, 12, 13].includes(id);
});

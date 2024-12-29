import { App, type IEventTrack, TrackType } from "$/types";

export const EVENT_TRACKS: IEventTrack[] = [
	{ id: App.TrackId[0], type: TrackType.LIGHT, label: "Back laser" },
	{ id: App.TrackId[1], type: TrackType.LIGHT, label: "Track neons" },
	{ id: App.TrackId[2], type: TrackType.LIGHT, side: "left", label: "Left laser" },
	{ id: App.TrackId[3], type: TrackType.LIGHT, side: "right", label: "Right laser" },
	{ id: App.TrackId[4], type: TrackType.LIGHT, label: "Primary light" },
	{ id: App.TrackId[5], type: TrackType.UNSUPPORTED },
	{ id: App.TrackId[6], type: TrackType.LIGHT, side: "left", label: "Left laser 2" },
	{ id: App.TrackId[7], type: TrackType.LIGHT, side: "right", label: "Right laser 2" },
	{ id: App.TrackId[8], type: TrackType.TRIGGER, label: "Ring rotation" },
	{ id: App.TrackId[9], type: TrackType.TRIGGER, label: "Small ring zoom" },
	{ id: App.TrackId[10], type: TrackType.LIGHT, side: "right", label: "Left laser 3" },
	{ id: App.TrackId[11], type: TrackType.LIGHT, side: "right", label: "Right laser 3" },
	{ id: App.TrackId[12], type: TrackType.VALUE, side: "right", label: "Left laser speed" },
	{ id: App.TrackId[13], type: TrackType.VALUE, side: "right", label: "Right laser speed" },
	{ id: App.TrackId[14], type: TrackType.UNSUPPORTED },
	{ id: App.TrackId[15], type: TrackType.UNSUPPORTED },
	{ id: App.TrackId[16], type: TrackType.VALUE, label: "Utility 1" },
	{ id: App.TrackId[17], type: TrackType.VALUE, label: "Utility 2" },
	{ id: App.TrackId[18], type: TrackType.VALUE, label: "Utility 3" },
	{ id: App.TrackId[19], type: TrackType.VALUE, label: "Utility 4" },
	{ id: App.TrackId[40], type: TrackType.VALUE, label: "Special 1" },
	{ id: App.TrackId[41], type: TrackType.VALUE, label: "Special 2" },
	{ id: App.TrackId[42], type: TrackType.VALUE, label: "Special 3" },
	{ id: App.TrackId[43], type: TrackType.VALUE, label: "Special 4" },
	{ id: App.TrackId[100], type: TrackType.UNSUPPORTED },
	{ id: App.TrackId[1000], type: TrackType.UNSUPPORTED },
] as const;

export const COMMON_EVENT_TRACKS = EVENT_TRACKS.filter(({ id }) => {
	const index = Object.keys(App.TrackId)[Object.values(App.TrackId).indexOf(id)];
	return [0, 1, 2, 3, 4, 8, 9, 12, 13].includes(Number(index));
});

import { App, TrackType } from "$/types";

export const EVENT_TRACKS = [
	{
		id: App.TrackId[12],
		label: "Left laser speed",
		type: TrackType.VALUE,
	} as const,
	{
		id: App.TrackId[2],
		label: "Left laser",
		type: TrackType.LIGHT,
	} as const,
	{
		id: App.TrackId[3],
		label: "Right laser",
		type: TrackType.LIGHT,
	} as const,
	{
		id: App.TrackId[13],
		label: "Right laser speed",
		type: TrackType.VALUE,
	} as const,
	{
		id: App.TrackId[0],
		label: "Back laser",
		type: TrackType.LIGHT,
	} as const,
	{
		id: App.TrackId[4],
		label: "Primary light",
		type: TrackType.LIGHT,
	} as const,
	{
		id: App.TrackId[1],
		label: "Track neons",
		type: TrackType.LIGHT,
	} as const,
	{
		id: App.TrackId[8],
		label: "Ring rotation",
		type: TrackType.TRIGGER,
	} as const,
	{
		id: App.TrackId[9],
		label: "Small ring zoom",
		type: TrackType.TRIGGER,
	} as const,
] as const;

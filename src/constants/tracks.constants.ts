import { type IEventTrack, TrackType } from "$/types";
import { pick } from "$/utils";

export const EVENT_TRACKS = {
	0: { type: TrackType.LIGHT },
	1: { type: TrackType.LIGHT },
	2: { type: TrackType.LIGHT, side: "left" },
	3: { type: TrackType.LIGHT, side: "right" },
	4: { type: TrackType.LIGHT },
	5: { type: TrackType.UNSUPPORTED },
	6: { type: TrackType.LIGHT, side: "left" },
	7: { type: TrackType.LIGHT, side: "right" },
	8: { type: TrackType.TRIGGER },
	9: { type: TrackType.TRIGGER },
	10: { type: TrackType.LIGHT, side: "left" },
	11: { type: TrackType.LIGHT, side: "right" },
	12: { type: TrackType.VALUE, side: "left" },
	13: { type: TrackType.VALUE, side: "right" },
	14: { type: TrackType.UNSUPPORTED },
	15: { type: TrackType.UNSUPPORTED },
	16: { type: TrackType.VALUE, side: "left" },
	17: { type: TrackType.VALUE, side: "right" },
	18: { type: TrackType.VALUE, side: "left" },
	19: { type: TrackType.VALUE, side: "right" },
	40: { type: TrackType.VALUE },
	41: { type: TrackType.VALUE },
	42: { type: TrackType.VALUE },
	43: { type: TrackType.VALUE },
	100: { type: TrackType.UNSUPPORTED },
	1000: { type: TrackType.UNSUPPORTED },
} as const satisfies Record<number, IEventTrack>;

export const ALL_EVENT_TRACKS = EVENT_TRACKS;

export const SUPPORTED_EVENT_TRACKS = pick(ALL_EVENT_TRACKS, 0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 16, 17, 18, 19);

export const COMMON_EVENT_TRACKS = pick(SUPPORTED_EVENT_TRACKS, 0, 1, 2, 3, 4, 8, 9, 12, 13);

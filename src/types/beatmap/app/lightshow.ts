import type { EntityId } from "@reduxjs/toolkit";
import type { EventColorType, LaserSpeedEventType, LaserSpeedTrackId, LightingEventType, LightingTrackId, RingEventType, RingTrackId, TrackId } from "./shared";

export interface BaseEvent {
	id: EntityId;
	trackId: TrackId;
	beatNum: number;
	selected?: boolean | "tentative";
}
export interface LightingEvent extends BaseEvent {
	trackId: LightingTrackId;
	type: LightingEventType;
	colorType?: EventColorType;
}
export interface RingEvent extends BaseEvent {
	trackId: RingTrackId;
	type: RingEventType;
}
export interface LaserSpeedEvent extends BaseEvent {
	trackId: LaserSpeedTrackId;
	type: LaserSpeedEventType;
	laserSpeed: number;
}
export type Event = LightingEvent | RingEvent | LaserSpeedEvent;

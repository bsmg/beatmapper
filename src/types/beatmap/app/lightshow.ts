import type { IEntity } from "../shared";
import type { EventColor, IEditorObject, LightEventType, LightTrackId, TrackId, TriggerEventType, TriggerTrackId, ValueEventType, ValueTrackId } from "./shared";

export interface IBaseBasicEvent extends IEntity, IEditorObject {
	beatNum: number;
	trackId: TrackId;
}
export interface IBasicLightEvent extends IBaseBasicEvent {
	trackId: LightTrackId;
	type: LightEventType;
	colorType?: EventColor;
}
export interface IBasicTriggerEvent extends IBaseBasicEvent {
	trackId: TriggerTrackId;
	type: TriggerEventType;
}
export interface IBasicValueEvent extends IBaseBasicEvent {
	trackId: ValueTrackId;
	type: ValueEventType;
	laserSpeed: number;
}
export type BasicEvent = IBasicLightEvent | IBasicTriggerEvent | IBasicValueEvent;

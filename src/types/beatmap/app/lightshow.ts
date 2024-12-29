import type { IEntity } from "../shared";
import type { EventColor, IEditorObject, LightEventType, TrackId, TriggerEventType, ValueEventType } from "./shared";

export interface IBaseBasicEvent extends IEntity, IEditorObject {
	beatNum: number;
	trackId: TrackId;
}
export interface IBasicLightEvent extends IBaseBasicEvent {
	type: LightEventType;
	colorType?: EventColor;
}
export interface IBasicTriggerEvent extends IBaseBasicEvent {
	type: TriggerEventType;
}
export interface IBasicValueEvent extends IBaseBasicEvent {
	type: ValueEventType;
	laserSpeed: number;
}
export type BasicEvent = IBasicLightEvent | IBasicTriggerEvent | IBasicValueEvent;

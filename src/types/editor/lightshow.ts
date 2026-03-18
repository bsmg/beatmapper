import type { Accept, Member } from "../utils";

export const EventEditMode = {
	PLACE: "place",
	SELECT: "select",
} as const;
export type EventEditMode = Member<typeof EventEditMode>;

export const EventTool = {
	ON: "on",
	OFF: "off",
	FLASH: "flash",
	FADE: "fade",
	TRANSITION: "transition",
} as const;
export type EventTool = Member<typeof EventTool>;

export const EventColor = {
	PRIMARY: "red",
	SECONDARY: "blue",
	WHITE: "white",
} as const;
export type EventColor = Member<typeof EventColor>;

export const BasicEventEffect = {
	OFF: "off",
	ON: "on",
	FLASH: "flash",
	FADE: "fade",
	TRANSITION: "transition",
	TRIGGER: "rotate",
	VALUE: "change-speed",
} as const;
export type BasicEventEffect = Accept<Member<typeof BasicEventEffect>, string>;

export type LightEventEffect = Member<Pick<typeof BasicEventEffect, "ON" | "OFF" | "FLASH" | "FADE" | "TRANSITION">>;
export type TriggerEventEffect = Member<Pick<typeof BasicEventEffect, "TRIGGER">>;
export type ValueEventEffect = Member<Pick<typeof BasicEventEffect, "VALUE">>;

export interface ILightState {
	color: string | null;
	brightness: number | null;
}

export interface IBackgroundBox {
	time: number;
	duration: number | null;
	startState: { [key in keyof ILightState]: NonNullable<ILightState[key]> };
	endState: { [key in keyof ILightState]: NonNullable<ILightState[key]> };
}

export interface ISelectionBoxInBeats {
	startBeat: number;
	endBeat: number;
	startTrackIndex: number;
	endTrackIndex: number;
	withPrevious?: boolean;
}

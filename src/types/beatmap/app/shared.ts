import type { ICustomDataBase } from "bsmap/types";

import type { Accept, Member } from "../../utils";

export interface IEditorObject {
	selected?: boolean;
	tentative?: boolean;
}
export type IWrapEditorObject<T> = IEditorObject & Omit<T, "customData"> & { customData: ICustomDataBase };

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

export const EventColor = {
	SECONDARY: "blue",
	PRIMARY: "red",
	WHITE: "white",
} as const;
export type EventColor = Member<typeof EventColor>;

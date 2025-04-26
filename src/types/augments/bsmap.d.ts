import type { NoteDirection } from "bsmap";

declare module "bsmap" {
	export declare function mirrorNoteDirectionHorizontally(direction: NoteDirection): NoteDirection;
	export declare function mirrorNoteDirectionVertically(direction: NoteDirection): NoteDirection;
}

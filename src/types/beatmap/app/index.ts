import type { ISong } from "./info";

export * from "./beatmap";
export * from "./info";
export * from "./shared";

export interface IEditorData {
	editorSettings?: Partial<Pick<ISong, "modSettings">>;
}

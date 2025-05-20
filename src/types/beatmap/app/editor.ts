import type { ISong } from "./info";

export interface IBookmark {
	time: number;
	name: string;
	color: string;
}

export interface EditorInfoData {
	editorSettings: Partial<Pick<ISong, "modSettings">>;
}

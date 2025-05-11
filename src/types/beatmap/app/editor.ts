import type { Song } from "./info";

export interface IBookmark {
	time: number;
	name: string;
	color: string;
}

export interface EditorInfoData {
	editorSettings: Partial<Pick<Song, "enabledFastWalls" | "enabledLightshow" | "modSettings">>;
}

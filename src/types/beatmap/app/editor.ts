import type { Song } from "./info";

export interface Bookmark {
	beatNum: number;
	name: string;
	color: {
		background: string;
		text: string;
	};
}

export interface EditorInfoData {
	editorSettings: Partial<Pick<Song, "enabledFastWalls" | "enabledLightshow" | "modSettings">>;
}

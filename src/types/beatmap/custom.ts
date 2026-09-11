import type { IModSettings } from "./app";

export interface IEditorData {
	id?: string;
	readonly?: boolean;
	createdAt?: number;
	lastOpenedAt?: number;
	lastOpenedBeatmapId?: string;
	modSettings?: Partial<IModSettings>;
}

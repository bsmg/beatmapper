import type { IModSettings } from "./app";

export interface IEditorData {
	editorSettings?: {
		modSettings?: Partial<IModSettings>;
	};
}

import type { ICustomDataBase } from "bsmap";

export interface IEditorObject {
	selected?: boolean;
	tentative?: boolean;
}

export type IWrapEditorObject<T> = IEditorObject & Omit<T, "customData"> & { customData: ICustomDataBase };

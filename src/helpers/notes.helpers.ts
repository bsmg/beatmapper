import { App } from "$/types";

export function resolveNoteId<T extends Pick<App.IBaseNote, "time" | "posX" | "posY">>(x: T) {
	return `${x.time}/${x.posX}/${x.posY}`;
}
export function resolveNoteColor<T extends Pick<App.IColorNote, "color">>({ color }: T) {
	if (color === -1) throw new Error(`Unsupported color type: ${color}`);
	return Object.values(App.SaberColor)[color];
}
export function resolveNoteDirection<T extends Pick<App.IColorNote, "direction">>({ direction }: T) {
	return Object.values(App.CutDirection)[direction];
}

export function calculateNoteDensity(numOfNotes: number, segmentLengthInBeats: number, bpm: number) {
	if (numOfNotes === 0) {
		return 0;
	}

	const numOfNotesPerBeat = numOfNotes / segmentLengthInBeats;
	const notesPerSecond = numOfNotesPerBeat * (bpm / 60);

	return notesPerSecond;
}

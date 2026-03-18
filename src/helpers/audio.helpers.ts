import { createAudioData, type IWrapAudioData, type IWrapAudioDataBPM } from "bsmap";
import { default as WaveformData } from "waveform-data";

import { roundToNearest } from "$/utils";
import { convertFileToArrayBuffer } from "./file.helpers";

export function convertMillisecondsToBeats(ms: number, bpm: number) {
	const bps = bpm / 60;
	const beats = (ms / 1000) * bps;
	// To avoid floating-point issues like 2.999999997, let's round. We'll choose
	// the lowest-common-multiple to "snap" to any possible value.
	return roundToNearest(beats, 1 / 96);
}

export function convertBeatsToMilliseconds(beats: number, bpm: number) {
	const bps = bpm / 60;
	return (beats / bps) * 1000;
}

export async function deriveAudioDataFromFile(file: Blob | MediaSource, audioContext: AudioContext) {
	const arrayBuffer = await convertFileToArrayBuffer(file);

	return await audioContext.decodeAudioData(arrayBuffer).then((audioBuffer) => {
		return { duration: audioBuffer.duration, frequency: audioBuffer.sampleRate, sampleCount: audioBuffer.length };
	});
}
export async function deriveWaveformDataFromFile(file: Blob | MediaSource, audioContext: AudioContext) {
	const arrayBuffer = await convertFileToArrayBuffer(file);

	return new Promise<WaveformData>((resolve, reject) =>
		WaveformData.createFromAudio({ audio_context: audioContext, array_buffer: arrayBuffer, scale: 128 }, (err, waveform) => {
			if (err) reject(err);
			resolve(waveform);
		}),
	);
}

export async function createAudioDataContentsFromFile(songFile: File, audioContext: AudioContext, options: { bpm: number; version?: number }): Promise<IWrapAudioData> {
	const { duration, frequency, sampleCount } = await deriveAudioDataFromFile(songFile, audioContext);

	// map will not load properly in-game if there isn't at least one bpm change defined. we call this peak stupid.
	const region: IWrapAudioDataBPM = {
		startSampleIndex: 0,
		endSampleIndex: sampleCount,
		startBeat: 0,
		endBeat: convertMillisecondsToBeats(duration * 1000, options.bpm),
	};

	return createAudioData({ version: options.version, frequency, sampleCount, bpmData: [region] });
}

export function snapToNearestBeat(cursorPosition: number, snapTo: number, bpm: number, offset: number) {
	const cursorPositionInBeats = convertMillisecondsToBeats(cursorPosition - offset, bpm);
	// cursorPosition will be a fluid value in ms, like 65.29. I need to snap to the nearest bar.
	// So if my BPM is 60, there is a bar every 4 seconds, so I'd round to 64ms.
	// Note that BPMs can be any value, even fractions, so I can't rely on a decimal rounding solution :/
	return convertBeatsToMilliseconds(roundToNearest(cursorPositionInBeats, snapTo), bpm) + offset;
}

export function formatCursorPosition(cursorPosition: number) {
	const seconds = Math.floor((cursorPosition / 1000) % 60).toString();
	const minutes = Math.floor((cursorPosition / (1000 * 60)) % 60).toString();

	return `${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`;
}

export function formatCursorPositionInBeats(cursorPositionInBeats: number) {
	return cursorPositionInBeats.toFixed(3);
}

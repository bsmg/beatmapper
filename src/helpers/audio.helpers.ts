import { type JsonWaveformData, default as WaveformData } from "waveform-data";

import { roundToNearest } from "$/utils";
import { convertFileToArrayBuffer } from "./file.helpers";

export function createHtmlAudioElement(url: string) {
	const elem = document.createElement("audio");
	elem.src = url;
	return elem;
}

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

export function deriveDurationFromWaveformData<T extends Pick<JsonWaveformData, "length" | "samples_per_pixel" | "sample_rate">>(waveform: T) {
	return (waveform.length * waveform.samples_per_pixel) / waveform.sample_rate;
}
export function deriveSampleCountFromWaveformData<T extends Pick<JsonWaveformData, "length" | "samples_per_pixel" | "sample_rate">>(waveform: T) {
	const duration = deriveDurationFromWaveformData(waveform);
	return waveform.sample_rate * duration;
}

export function snapToNearestBeat(cursorPosition: number, bpm: number, offset: number) {
	// cursorPosition will be a fluid value in ms, like 65.29. I need to snap to the nearest bar.
	// So if my BPM is 60, there is a bar every 4 seconds, so I'd round to 64ms.
	// Note that BPMs can be any value, even fractions, so I can't rely on a decimal rounding solution :/
	const cursorPositionInBeats = convertMillisecondsToBeats(cursorPosition - offset, bpm);

	return convertBeatsToMilliseconds(Math.round(cursorPositionInBeats), bpm) + offset;
}

export function getFormattedTimestamp(cursorPosition: number) {
	const seconds = String(Math.floor((cursorPosition / 1000) % 60)).padStart(2, "0");
	const minutes = String(Math.floor((cursorPosition / (1000 * 60)) % 60)).padStart(2, "0");

	return `${minutes}:${seconds}`;
}

export function getFormattedBeatNum(cursorPositionInBeats: number) {
	return cursorPositionInBeats.toFixed(3);
}

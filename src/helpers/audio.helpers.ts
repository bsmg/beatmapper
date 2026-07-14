import { distinct } from "@std/collections/distinct";
import { createAudioData, createBPMEvent, type IWrapAudioData, type IWrapAudioDataBPM, type IWrapBPMEvent, type IWrapDifficulty, sortObjectFn } from "bsmap";
import { default as WaveformData } from "waveform-data";

import { getAudioContext } from "$/setup";
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

export async function deriveAudioDataFromFile(file: Blob | MediaSource) {
	const audioContext = getAudioContext();

	const arrayBuffer = await convertFileToArrayBuffer(file);

	return await audioContext.decodeAudioData(arrayBuffer).then((audioBuffer) => {
		return { duration: audioBuffer.duration, frequency: audioBuffer.sampleRate, sampleCount: audioBuffer.length };
	});
}
export async function deriveWaveformDataFromFile(file: Blob | MediaSource) {
	const audioContext = getAudioContext();

	const arrayBuffer = await convertFileToArrayBuffer(file);
	const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));

	const samples = audioBuffer.length;
	const scale = Math.floor(samples / window.innerWidth);

	return new Promise<WaveformData>((resolve, reject) =>
		// clamp the upper bounds of scale for performance
		WaveformData.createFromAudio({ audio_context: audioContext, array_buffer: arrayBuffer, scale: Math.min(scale, 128) }, (err, waveform) => {
			if (err) reject(err);
			resolve(waveform);
		}),
	);
}

export async function createAudioDataContentsFromFile(songFile: File, options: { bpm: number; version?: number }): Promise<IWrapAudioData> {
	const { duration, frequency, sampleCount } = await deriveAudioDataFromFile(songFile);

	// map will not load properly in-game if there isn't at least one bpm change defined. we call this peak stupid.
	const region: IWrapAudioDataBPM = {
		startSampleIndex: 0,
		endSampleIndex: sampleCount,
		startBeat: 0,
		endBeat: convertMillisecondsToBeats(duration * 1000, options.bpm),
	};

	return createAudioData({ version: options.version, frequency, sampleCount, bpmData: [region] });
}

export function createBpmDataFromDifficulty(difficulty: IWrapDifficulty, frequency: number, durationInBeats: number): IWrapAudioData["bpmData"] {
	const allRegions = distinct([...difficulty.bpmEvents.map((e) => ({ time: e.time, bpm: e.bpm }))]).sort(sortObjectFn);

	const addPoint = (curr: { time: number; bpm: number }, i: number): IWrapAudioDataBPM => {
		const next = allRegions[i + 1];
		const endBeat = next ? next.time : durationInBeats;
		const samplesPerBeat = (60 / curr.bpm) * frequency;

		return {
			startBeat: curr.time,
			endBeat: endBeat,
			startSampleIndex: Math.floor(curr.time * samplesPerBeat),
			endSampleIndex: Math.floor(endBeat * samplesPerBeat),
		};
	};

	return allRegions.map(addPoint);
}
export function createBpmEventsFromAudioData({ bpmData, frequency }: IWrapAudioData): IWrapBPMEvent[] {
	return bpmData.map((region) => {
		const beatDelta = region.endBeat - region.startBeat;
		const sampleDelta = region.endSampleIndex - region.startSampleIndex;

		const derivedBpm = sampleDelta === 0 ? 0 : (beatDelta / sampleDelta) * frequency * 60;

		return createBPMEvent({
			time: region.startBeat,
			bpm: Math.round(derivedBpm * 1000) / 1000,
		});
	});
}

export function formatCursorPosition(cursorPosition: number) {
	const seconds = Math.floor((cursorPosition / 1000) % 60).toString();
	const minutes = Math.floor((cursorPosition / (1000 * 60)) % 60).toString();

	return `${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`;
}

export function formatCursorPositionInBeats(cursorPositionInBeats: number) {
	return cursorPositionInBeats.toFixed(3);
}

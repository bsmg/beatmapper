import { distinct } from "@std/collections/distinct";
import { createAudioData, createBPMEvent, type IBPMTimeScale, type IWrapAudioData, type IWrapAudioDataBPM, type IWrapBPMEvent, type IWrapDifficulty, sortObjectFn } from "bsmap";
import { default as WaveformData } from "waveform-data";

export async function decodeAudioData(songFile: File, audioContext: AudioContext) {
	const arrayBuffer = await songFile.arrayBuffer();
	return audioContext.decodeAudioData(arrayBuffer.slice(0));
}
export async function decodeWaveformData(songFile: File, audioContext: AudioContext) {
	const arrayBuffer = await songFile.arrayBuffer();
	const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));

	return new Promise<WaveformData>((resolve, reject) => {
		const scale = Math.floor(audioBuffer.length / window.innerWidth);
		// clamp the upper bounds of scale for performance
		return WaveformData.createFromAudio({ audio_context: audioContext, array_buffer: arrayBuffer, scale: Math.min(scale, 128) }, (err, waveform) => {
			if (err) reject(err);
			resolve(waveform);
		});
	});
}

export async function createAudioDataContentsFromFile(songFile: File, audioContext: AudioContext, options: { bpm: number; version?: number }): Promise<IWrapAudioData> {
	const arrayBuffer = await songFile.arrayBuffer();
	const { duration, sampleRate: frequency, length: sampleCount } = await audioContext.decodeAudioData(arrayBuffer);

	// map will not load properly in-game if there isn't at least one bpm change defined. we call this peak stupid.
	const region: IWrapAudioDataBPM = {
		startSampleIndex: 0,
		endSampleIndex: sampleCount,
		startBeat: 0,
		endBeat: duration * (options.bpm / 60),
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

		const bpm = sampleDelta === 0 ? 0 : (beatDelta / sampleDelta) * frequency * 60;

		return createBPMEvent({ time: region.startBeat, bpm });
	});
}
export function createTimescaleFromAudioData({ bpmData, frequency }: IWrapAudioData, options: { bpm: number }): IBPMTimeScale[] {
	return bpmData.map((region) => {
		const beatDelta = region.endBeat - region.startBeat;
		const sampleDelta = region.endSampleIndex - region.startSampleIndex;
		const bpm = (beatDelta / sampleDelta) * frequency * 60;
		return { time: region.startBeat, bpm: bpm, scale: options.bpm / bpm };
	});
}

export function formatCursorPosition(cursorPosition: number) {
	const seconds = Math.floor(cursorPosition % 60).toString();
	const minutes = Math.floor((cursorPosition / 60) % 60).toString();

	return `${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`;
}

export function formatCursorPositionInBeats(cursorPositionInBeats: number) {
	return cursorPositionInBeats.toFixed(3);
}

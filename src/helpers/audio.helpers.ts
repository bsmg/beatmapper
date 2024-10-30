import { default as WaveformData } from "waveform-data";

import { LOWEST_COMMON_MULTIPLE } from "$/constants";
import { roundToNearest } from "$/utils";

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
	return roundToNearest(beats, LOWEST_COMMON_MULTIPLE);
}

export function convertBeatsToMilliseconds(beats: number, bpm: number) {
	const bps = bpm / 60;
	return (beats / bps) * 1000;
}

export function getWaveformDataForFile(file: Blob | MediaSource) {
	const fileBlobUrl = URL.createObjectURL(file);
	const audioContext = new AudioContext();

	return new Promise<WaveformData>((resolve, reject) => {
		fetch(fileBlobUrl)
			.then((response) => response.arrayBuffer())
			.then((buffer) => {
				WaveformData.createFromAudio({ audio_context: audioContext, array_buffer: buffer }, (err, waveform) => {
					if (err) {
						reject(err);
					}

					resolve(waveform);
				});
			});
	});
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
	const beatNum = Math.floor(cursorPositionInBeats);
	const remainder = String(roundToNearest(Math.abs(cursorPositionInBeats) % 1, LOWEST_COMMON_MULTIPLE))
		.replace("0.", "")
		.slice(0, 3)
		.padEnd(3, "0");

	return `${beatNum}.${remainder}`;
}

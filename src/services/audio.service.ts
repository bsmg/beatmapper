/**
 * This service abstracts the Web Audio API to allow easy, precise playback
 * of audio files.
 */

// @ts-expect-error
const AudioContext = window.AudioContext || window.webkitAudioContext;

export class AudioSample {
	gain: number;
	playbackRate: number;
	context: AudioContext;
	startTime: number | null;
	playbackRateLastSetAt: number | null;
	startOffset: number;
	isPlaying: boolean;
	gainNode: GainNode;
	source!: AudioBufferSourceNode;
	buffer!: AudioBuffer;
	constructor(volume = 1, playbackRate = 1) {
		this.gain = volume;
		this.playbackRate = playbackRate;

		this.context = new AudioContext();

		// Audio contexts have an always-incrementing `currentTime` ticker.
		// When we start the file, we might be 20 seconds into that process, so
		// we'll store the currentTime position that the audio started playing.
		this.startTime = null;

		// If playback rate changes, we need track when for computation
		this.playbackRateLastSetAt = null;

		// When we pause the song, we might be 55 seconds into its playback.
		// Store the number 55, so that we know where to resume from.
		// This is because there is no native "pause" functionality.
		this.startOffset = 0;

		this.isPlaying = false;

		this.gainNode = this.context.createGain();
		this.gainNode.connect(this.context.destination);
		this.gainNode.gain.value = volume;
	}

	changeVolume(volume: number) {
		this.gain = volume;
		this.gainNode.gain.value = this.gain;
	}

	changePlaybackRate(playbackRate: number) {
		// Every time that the playback rate changes,
		// we first need to calculate how much elapsed with the old rate,
		// offset the start time to compensate, and then start a new segment
		const rateAdjustedElapsed = this.getRateAdjustedElapsed();
		const realElapsed = this.context.currentTime - (this.playbackRateLastSetAt ?? 0);

		// We have to shift the playback head pointer backwards or forwards,
		// to make up for changes in playback rate
		this.startTime = (this.startTime ?? 0) + realElapsed - rateAdjustedElapsed;

		this.playbackRateLastSetAt = this.context.currentTime;
		this.playbackRate = playbackRate;

		// Audio source might not yet be loaded
		if (this.source) {
			this.source.playbackRate.value = this.playbackRate;
		}
	}

	load(arrayBuffer: ArrayBuffer) {
		// TODO: Also handle a path, if we don't conveniently already have an
		// array buffer?
		return new Promise((resolve, reject) => {
			this.context.decodeAudioData(
				arrayBuffer,
				(buffer) => {
					this.buffer = buffer;

					resolve(buffer);
				},
				reject,
			);
		});
	}

	play() {
		// Keep track of when we started playing.
		this.startTime = this.context.currentTime - this.startOffset;
		this.playbackRateLastSetAt = this.context.currentTime;
		this.isPlaying = true;

		this.source = this.context.createBufferSource();
		this.source.buffer = this.buffer;
		this.source.playbackRate.value = this.playbackRate;
		this.source.connect(this.gainNode);

		this.source.start(0, this.startOffset);
	}

	pause() {
		if (!this.isPlaying) {
			return;
		}

		this.isPlaying = false;
		this.source.stop();
		// Measure how much time passed since the last pause.
		this.startOffset += this.context.currentTime - (this.startTime ?? 0);
	}

	isBufferLoaded() {
		return !!this.buffer;
	}

	getCurrentTime() {
		return this.getRateAdjustedElapsed() + (this.playbackRateLastSetAt ?? 0 - (this.startTime ?? 0));
	}

	getRateAdjustedElapsed() {
		return (this.context.currentTime - (this.playbackRateLastSetAt ?? 0)) * this.playbackRate;
	}

	setCurrentTime(time: number) {
		// This method should update `startOffset` so that when we unpause it,
		// we pick up from the right place.

		if (this.isPlaying) {
			this.pause();
			this.startOffset = time;
			this.play();
		} else {
			this.startOffset = time;
		}
	}
}
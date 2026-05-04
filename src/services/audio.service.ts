export interface AudioSampleOptions {
	url?: string;
	volume?: number;
	playbackRate?: number;
}

/**
 * This service abstracts the Web Audio API to allow easy, precise playback of audio files.
 */
export class AudioSample {
	gain: number;
	playbackRate: number;
	context: AudioContext;
	startTime: number;
	playbackRateLastSetAt: number;
	startOffset: number;
	isPlaying: boolean;
	gainNode: GainNode;
	source!: AudioBufferSourceNode;
	buffer!: AudioBuffer;

	constructor({ volume = 1, playbackRate = 1 }: AudioSampleOptions) {
		this.gain = volume;
		this.playbackRate = playbackRate;

		this.context = new AudioContext();

		// Audio contexts have an always-incrementing `currentTime` ticker.
		// When we start the file, we might be 20 seconds into that process, so we'll store the currentTime position that the audio started playing.
		this.startTime = 0;

		// If playback rate changes, we need track when for computation
		this.playbackRateLastSetAt = 0;

		// When we pause the song, we might be 55 seconds into its playback. Store the number 55, so that we know where to resume from.
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
		this.startOffset = this.getCurrentTime();
		this.playbackRateLastSetAt = this.context.currentTime;
		this.playbackRate = playbackRate;

		if (this.source) {
			this.source.playbackRate.value = this.playbackRate;
		}
	}

	async load(path: string) {
		const buffer = await fetch(path).then((response) => response.arrayBuffer());
		return this.loadFromArrayBuffer(buffer);
	}

	async loadFromFile(file: File) {
		const buffer = await file.arrayBuffer();
		return this.loadFromArrayBuffer(buffer);
	}

	async loadFromArrayBuffer(arrayBuffer: ArrayBuffer) {
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

	play(startTime?: number, duration?: number, onFinished?: () => void) {
		if (this.isPlaying) {
			this.pause();
		}

		const actualOffset = startTime !== undefined ? startTime : this.startOffset;

		this.startTime = this.context.currentTime - actualOffset / this.playbackRate;
		this.playbackRateLastSetAt = this.context.currentTime;
		this.isPlaying = true;

		this.source = this.context.createBufferSource();
		this.source.buffer = this.buffer;
		this.source.playbackRate.value = this.playbackRate;
		this.source.connect(this.gainNode);

		if (duration !== undefined) {
			this.source.start(0, actualOffset, duration);

			this.source.onended = () => {
				this.isPlaying = false;
				if (onFinished) onFinished();
			};
		} else {
			this.source.start(0, actualOffset);
		}
	}

	pause() {
		if (!this.isPlaying) {
			return;
		}

		this.startOffset = this.getCurrentTime();
		this.isPlaying = false;
		this.source.stop();
	}

	trigger() {
		this.pause();
		this.setCurrentTime(0);
		this.play();
	}

	isBufferLoaded() {
		return !!this.buffer;
	}

	getCurrentTime() {
		if (!this.isPlaying) {
			return this.startOffset;
		}

		return this.startOffset + (this.context.currentTime - this.playbackRateLastSetAt) * this.playbackRate;
	}

	getRateAdjustedElapsed() {
		return (this.context.currentTime - this.playbackRateLastSetAt) * this.playbackRate;
	}

	setCurrentTime(time: number) {
		// This method updates `startOffset` so that when we unpause it, we pick up from the right place.
		if (this.isPlaying) {
			this.pause();
			this.startOffset = Math.max(time, 0);
			this.play();
		} else {
			this.startOffset = Math.max(time, 0);
		}
	}
}

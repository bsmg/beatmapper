export interface AudioSampleOptions {
	volume?: number;
	playbackRate?: number;
}

export class AudioSample {
	#context: AudioContext;
	#gainNode: GainNode;
	#buffer?: AudioBuffer;
	#source?: AudioBufferSourceNode;

	#startTime = 0;
	#startOffset = 0;
	#lastTime = 0;
	#animationFrameId: number | null = null;
	#onTickCallback?: (currentTime: number, lastTime: number) => void;

	isPlaying = false;
	playbackRate: number;

	get duration(): number {
		return this.#buffer?.duration ?? 0;
	}

	constructor(audioContext: AudioContext, { volume = 1, playbackRate = 1 }: AudioSampleOptions) {
		this.#context = audioContext;
		this.playbackRate = playbackRate;

		this.#gainNode = this.#context.createGain();
		this.#gainNode.connect(this.#context.destination);
		this.#gainNode.gain.value = volume;
	}

	#resetTimings(offset = this.getCurrentTime()) {
		this.#startOffset = Math.max(offset, 0);
		this.#startTime = this.#context.currentTime;
		this.#lastTime = this.#context.currentTime;
	}

	changeVolume(volume: number) {
		this.#gainNode.gain.value = volume;
	}
	changePlaybackRate(playbackRate: number) {
		this.#resetTimings();
		this.playbackRate = playbackRate;

		if (this.#source) {
			this.#source.playbackRate.value = playbackRate;
		}
	}

	async load(path: string) {
		const response = await fetch(path);
		return this.loadFromArrayBuffer(await response.arrayBuffer());
	}
	async loadFromFile(file: File) {
		return this.loadFromArrayBuffer(await file.arrayBuffer());
	}
	async loadFromArrayBuffer(arrayBuffer: ArrayBuffer) {
		this.#buffer = await this.#context.decodeAudioData(arrayBuffer);
		return this.#buffer;
	}

	play(startTime?: number, duration?: number, onFinished?: () => void) {
		if (!this.#buffer) return;

		if (this.isPlaying) {
			this.pause();
		}
		if (startTime !== undefined) {
			this.#resetTimings(startTime);
		} else {
			this.#resetTimings();
		}

		this.isPlaying = true;

		this.#source = this.#context.createBufferSource();
		this.#source.buffer = this.#buffer;
		this.#source.playbackRate.value = this.playbackRate;
		this.#source.connect(this.#gainNode);

		if (duration !== undefined) {
			this.#source.start(0, this.#startOffset, duration);
			this.#source.onended = () => {
				this.#stopAnimationLoop();
				this.isPlaying = false;
				onFinished?.();
			};
		} else {
			this.#source.start(0, this.#startOffset);
		}

		this.#startAnimationLoop();
	}
	pause() {
		if (!this.isPlaying) return;

		this.#startOffset = this.getCurrentTime();
		this.#stopAnimationLoop();
		this.isPlaying = false;

		this.#source?.stop();
		this.#source = undefined;
	}
	trigger() {
		this.pause();
		this.setCurrentTime(0);
		this.play();
	}

	isBufferLoaded(): boolean {
		return !!this.#buffer;
	}

	getCurrentTime(): number {
		if (!this.isPlaying) return this.#startOffset;
		return this.#startOffset + (this.#context.currentTime - this.#startTime) * this.playbackRate;
	}
	setCurrentTime(time: number) {
		this.#resetTimings(time);

		if (this.isPlaying) {
			this.pause();
			this.play();
		}
	}

	onTick(callback: (currentTime: number, lastTime: number) => void) {
		this.#onTickCallback = callback;
	}

	#startAnimationLoop() {
		const loop = () => {
			if (!this.isPlaying) return;

			const currentTime = this.getCurrentTime();
			const lastTime = this.#startOffset + (this.#lastTime - this.#startTime) * this.playbackRate;

			this.#onTickCallback?.(currentTime, lastTime);
			this.#lastTime = this.#context.currentTime;
			this.#animationFrameId = window.requestAnimationFrame(loop);
		};

		this.#animationFrameId = window.requestAnimationFrame(loop);
	}
	#stopAnimationLoop() {
		if (this.#animationFrameId !== null) {
			window.cancelAnimationFrame(this.#animationFrameId);
			this.#animationFrameId = null;
		}
	}
}

import { AudioSample, type AudioSampleOptions } from "./audio.service";

/**
 * This mini-service wraps the AudioSample service to provide an easy-to-use tick SFX.
 */
export class Sfx {
	audioSample: AudioSample;
	constructor(sfxPath: string, options: AudioSampleOptions = { volume: 1, playbackRate: 1 }) {
		this.audioSample = new AudioSample(options);

		fetch(sfxPath)
			.then((res) => res.arrayBuffer())
			.then((arrayBuffer) => this.audioSample.loadFromArrayBuffer(arrayBuffer));
	}

	trigger() {
		this.audioSample.pause();
		this.audioSample.setCurrentTime(0);
		this.audioSample.play();
	}
}

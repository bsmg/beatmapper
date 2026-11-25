import type { HotkeyStore } from "@ark-ui/react/hotkeys";
import { type Camera, Object3D, Vector3, type Vector3Tuple } from "three";

interface Options {
	camera: Camera;
	hotkeys: HotkeyStore;
	initialPosition?: Vector3Tuple;
	speed?: number;
	isEnabled: () => boolean;
}

export class Controls {
	#camera: Camera;
	#hotkeys: HotkeyStore;
	#speed: number;
	#initialPosition: Vector3Tuple;
	#pitchObject: Object3D;
	#yawObject: Object3D;
	#velocity: Vector3;
	#time: number;
	#isEnabled: () => boolean;

	constructor({ camera, hotkeys, initialPosition = [0, 0, 0], speed = 1, isEnabled }: Options) {
		this.#camera = camera;
		this.#hotkeys = hotkeys;
		this.#speed = speed;
		this.#initialPosition = initialPosition;
		this.#isEnabled = isEnabled;

		camera.rotation.set(0, 0, 0);

		this.#pitchObject = new Object3D();
		this.#pitchObject.add(this.#camera);

		this.#yawObject = new Object3D();
		this.#yawObject.position.set(...this.#initialPosition);
		this.#yawObject.add(this.#pitchObject);

		this.#velocity = new Vector3();
		this.#time = window.performance.now();
	}

	get enabled() {
		return this.#isEnabled();
	}

	getObject = () => this.#yawObject;

	#isCommandActive = (id: string) => {
		const { commands } = this.#hotkeys.getState();
		const command = commands.get(id);
		if (!command) return false;
		return this.#hotkeys.isPressed(command.hotkey);
	};

	handleMouseMove = (event: MouseEvent) => {
		if (this.enabled) {
			const movementX = event.movementX || 0;
			const movementY = event.movementY || 0;

			const maxPitch = Math.PI / 2 - 0.01;
			this.#pitchObject.rotation.x = Math.max(-maxPitch, Math.min(maxPitch, this.#pitchObject.rotation.x - movementY * 0.004));
			this.#yawObject.rotation.y -= movementX * 0.004;
		}
	};

	update = () => {
		const currentTime = performance.now();
		const delta = (currentTime - this.#time) / 1000;

		this.#velocity.multiplyScalar(Math.max(0, 1 - 10.0 * delta));

		const distance = 200 * this.#speed * delta;

		if (this.enabled) {
			const input = new Vector3();
			const pitch = this.#pitchObject.rotation.x;

			if (this.#isCommandActive("controls/forwards")) {
				input.z -= Math.cos(pitch);
				input.y += Math.sin(pitch);
			}
			if (this.#isCommandActive("controls/backwards")) {
				input.z += Math.cos(pitch);
				input.y -= Math.sin(pitch);
			}
			if (this.#isCommandActive("controls/left")) {
				input.x -= 1;
			}
			if (this.#isCommandActive("controls/right")) {
				input.x += 1;
			}
			if (this.#isCommandActive("controls/down")) {
				input.y -= 1;
			}
			if (this.#isCommandActive("controls/up")) {
				input.y += 1;
			}

			if (input.lengthSq() > 0) {
				input.normalize().multiplyScalar(distance);
				this.#velocity.add(input);
			}

			if (this.#isCommandActive("controls/reset")) {
				this.#velocity.set(0, 0, 0);
				this.#yawObject.position.set(...this.#initialPosition);
				this.#yawObject.rotation.y = 0;
				this.#pitchObject.rotation.x = 0;
			}
		}

		const speed = this.#velocity.length();

		if (speed > 0) {
			const container = this.getObject();
			const direction = this.#velocity.clone().divideScalar(speed);
			container.translateOnAxis(direction, speed * delta);
		}

		this.#time = currentTime;
	};
}

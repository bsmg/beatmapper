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

			this.#pitchObject.rotation.x -= movementY * 0.004;
			this.#yawObject.rotation.y -= movementX * 0.004;
		}
	};

	update = () => {
		const currentTime = performance.now();
		const delta = (currentTime - this.#time) / 1000;

		this.#velocity.x -= this.#velocity.x * 10.0 * delta;
		this.#velocity.y -= this.#velocity.y * 10.0 * delta;
		this.#velocity.z -= this.#velocity.z * 10.0 * delta;

		const SPEED_MULTIPLIER = 200;
		const distance = SPEED_MULTIPLIER * this.#speed * delta;

		if (this.enabled) {
			const verticalDistance = Math.tan(this.#pitchObject.rotation.x) * distance;

			if (this.#isCommandActive("controls/forwards")) {
				this.#velocity.z -= distance;
				this.#velocity.y += verticalDistance;
			}
			if (this.#isCommandActive("controls/backwards")) {
				this.#velocity.z += distance;
				this.#velocity.y -= verticalDistance;
			}
			if (this.#isCommandActive("controls/left")) {
				this.#velocity.x -= distance;
			}
			if (this.#isCommandActive("controls/right")) {
				this.#velocity.x += distance;
			}
			if (this.#isCommandActive("controls/down")) {
				this.#velocity.y -= distance;
			}
			if (this.#isCommandActive("controls/up")) {
				this.#velocity.y += distance;
			}
			if (this.#isCommandActive("controls/reset")) {
				this.#velocity.set(0, 0, 0);
				this.#yawObject.position.set(...this.#initialPosition);
				this.#yawObject.rotation.y = 0;
				this.#pitchObject.rotation.x = 0;
			}
		}

		const container = this.getObject();

		container.translateX(this.#velocity.x * delta);
		container.translateY(this.#velocity.y * delta);
		container.translateZ(this.#velocity.z * delta);

		this.#time = currentTime;
	};
}

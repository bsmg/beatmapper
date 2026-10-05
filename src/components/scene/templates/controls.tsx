import { useHotkeyStore, useHotkeys } from "@ark-ui/react/hotkeys";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

import { getHotkeyCategory, getHotkeyScopes } from "$/components/app/helpers";
import { useGlobalEventListener } from "$/components/hooks/use-global-event-listener";
import { Controls as Service } from "$/services/controls.service";

const noop = () => {};

export function Controls() {
	const hotkeys = useHotkeyStore();
	const controls = useRef<Service | null>(null);

	const isEnabled = useRef<boolean>(false);

	useFrame(({ gl, scene, camera }) => {
		if (!controls.current) {
			controls.current = new Service({ camera, hotkeys, isEnabled: () => isEnabled.current });
			scene.add(controls.current.getObject());
		} else {
			controls.current.update();
		}

		if (isEnabled.current) {
			if (document.pointerLockElement !== gl.domElement) {
				gl.domElement.requestPointerLock();
			}
		} else {
			if (document.pointerLockElement === gl.domElement) {
				document.exitPointerLock();
			}
		}
	});

	const scopes = getHotkeyScopes("editor", "camera");
	const category = getHotkeyCategory(scopes);

	// movement logic is handled by the controls service within the frame loop; we just need to register the hotkeys and bind them to their respective ids.
	useHotkeys({
		commands: [
			{ id: "controls/forwards", scopes, category, label: "Move Forwards", hotkey: "W", action: noop },
			{ id: "controls/backwards", scopes, category, label: "Move Backwards", hotkey: "S", action: noop },
			{ id: "controls/left", scopes, category, label: "Move Left", hotkey: "A", action: noop },
			{ id: "controls/right", scopes, category, label: "Move Right", hotkey: "D", action: noop },
			{ id: "controls/up", scopes, category, label: "Move Up", hotkey: "E", action: noop },
			{ id: "controls/down", scopes, category, label: "Move Down", hotkey: "Q", action: noop },
			{ id: "controls/reset", scopes, category, label: "Reset", hotkey: "Backspace", action: noop },
		],
	});

	useGlobalEventListener("pointerdown", (ev) => {
		if (ev.button === 2) {
			isEnabled.current = true;
			hotkeys.addScope("camera");
		}
	});
	useGlobalEventListener("pointerup", (ev) => {
		if (ev.button === 2) {
			isEnabled.current = false;
			hotkeys.removeScope("camera");
		}
	});

	useGlobalEventListener("mousemove", (ev) => {
		if (!controls.current) return;
		return controls.current.handleMouseMove(ev);
	});

	return null;
}

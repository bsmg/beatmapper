import { useHotkeyStore, useHotkeys } from "@ark-ui/react/hotkeys";
import { useFrame } from "@react-three/fiber";
import { useCallback, useRef } from "react";

import { getHotkeyCategory, getHotkeyScopes } from "$/components/app/helpers";
import { useGlobalEventListener } from "$/components/hooks/use-global-event-listener";
import { Controls as Service } from "$/services/controls.service";

const noop = () => {};

export function Controls() {
	const hotkeys = useHotkeyStore();
	const controls = useRef<Service | null>(null);

	const isEnabled = useCallback(() => hotkeys.isPressed("Shift"), [hotkeys]);

	useFrame(({ gl, scene, camera }) => {
		if (!controls.current) {
			controls.current = new Service({ camera, hotkeys, isEnabled });
			scene.add(controls.current.getObject());
		} else {
			controls.current.update();
		}

		if (isEnabled()) {
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
			{ id: "controls/forwards", scopes, category, label: "Move Forwards", hotkey: "Shift+W", action: noop },
			{ id: "controls/backwards", scopes, category, label: "Move Backwards", hotkey: "Shift+S", action: noop },
			{ id: "controls/left", scopes, category, label: "Move Left", hotkey: "Shift+A", action: noop },
			{ id: "controls/right", scopes, category, label: "Move Right", hotkey: "Shift+D", action: noop },
			{ id: "controls/up", scopes, category, label: "Move Up", hotkey: "Shift+R", action: noop },
			{ id: "controls/down", scopes, category, label: "Move Down", hotkey: "Shift+F", action: noop },
			{ id: "controls/reset", scopes, category, label: "Reset", hotkey: "Shift+Backspace", action: noop },
		],
	});

	useGlobalEventListener("mousemove", (ev) => {
		if (!controls.current) return;
		return controls.current.handleMouseMove(ev);
	});

	return null;
}

import { useHotkeyStore, useHotkeys } from "@ark-ui/react/hotkeys";
import { useFrame } from "@react-three/fiber";
import { useCallback, useRef } from "react";

import { getHotkeyScopes } from "$/components/app/helpers";
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

	// movement logic is handled by the controls service within the frame loop; we just need to register the hotkeys and bind them to their respective ids.
	useHotkeys({
		commands: [
			{ id: "controls/forwards", hotkey: "Shift+W", scopes: getHotkeyScopes("editor"), action: noop },
			{ id: "controls/backwards", hotkey: "Shift+S", scopes: getHotkeyScopes("editor"), action: noop },
			{ id: "controls/left", hotkey: "Shift+A", scopes: getHotkeyScopes("editor"), action: noop },
			{ id: "controls/right", hotkey: "Shift+D", scopes: getHotkeyScopes("editor"), action: noop },
			{ id: "controls/up", hotkey: "Shift+R", scopes: getHotkeyScopes("editor"), action: noop },
			{ id: "controls/down", hotkey: "Shift+F", scopes: getHotkeyScopes("editor"), action: noop },
			{ id: "controls/reset", hotkey: "Shift+Backspace", scopes: getHotkeyScopes("editor"), action: noop },
		],
	});

	useGlobalEventListener("mousemove", (ev) => {
		if (!controls.current) return;
		return controls.current.handleMouseMove(ev);
	});

	return null;
}

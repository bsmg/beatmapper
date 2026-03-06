/** biome-ignore-all lint/correctness/useExhaustiveDependencies: controlled updates */
import { config, useSpring } from "@react-spring/three";
import { useFrame } from "@react-three/fiber";
import { useParams } from "@tanstack/react-router";
import { useEffect } from "react";

import { useAppSelector } from "$/store/hooks";
import { selectBloomEnabled, selectCursorPositionInBeats, selectPlaying } from "$/store/selectors";
import { App } from "$/types";
import { lerp, lerpColor } from "$/utils";
import type { useLightEffect } from "./environment.hooks";

// ~~Complicated Business~~
// When certain statuses occur - flash, fade - we want to reset the spring, so that it does the "from" and "to" again.
// This should happen even when the status hasn't changed (eg. a series of `flash` events in a row should all trigger the reset, and get momentarily brighter).
//
// If I just set `reset: true` based on the status, though, then it resets _on every frame_, meaning that the value is just perpetually locked to the `from` value.
// So I need to let a single render pass when `reset` is true.
//
// I cache the event ID so that I can distinguish the first render after it changes.
// When that happens, I set `reset` to true and update the cache, so that the next render sets it back to `false`.
//
// This feels hacky, but I don't know of a better way.

export interface UseLightSpringOptions {
	light: ReturnType<typeof useLightEffect>;
}
export function useLightSpring({ light }: UseLightSpringOptions) {
	const { sid } = useParams({ from: "/_/edit/$sid/$bid/_" });

	const isPlaying = useAppSelector(selectPlaying);
	const isBloomEnabled = useAppSelector(selectBloomEnabled);

	const cursorPositionInBeats = useAppSelector((state) => selectCursorPositionInBeats(state, sid) ?? 0);

	const [spring, api] = useSpring(
		() => ({
			from: {
				emissive: light.prevState.color,
				emissiveIntensity: 0,
				opacity: 0,
			},
		}),
		[isPlaying],
	);

	useEffect(() => {
		const { lastEffect, prevState } = light;

		switch (lastEffect) {
			case App.BasicEventEffect.FLASH: {
				api.start({
					from: { emissive: prevState.color, emissiveIntensity: prevState.brightness * 1.5, opacity: 1 },
					to: { emissive: prevState.color, emissiveIntensity: prevState.brightness, opacity: 1 },
					config: config.molasses,
					reset: true,
				});
				break;
			}
			case App.BasicEventEffect.FADE: {
				api.start({
					from: { emissive: prevState.color, emissiveIntensity: prevState.brightness * 1.5, opacity: 1 },
					to: { emissive: prevState.color, emissiveIntensity: 0, opacity: 0 },
					config: config.molasses,
					reset: true,
				});
				break;
			}
			case App.BasicEventEffect.OFF: {
				api.start({ emissive: prevState.color, emissiveIntensity: 0, opacity: 0, immediate: true });
				break;
			}
			case App.BasicEventEffect.ON:
			case App.BasicEventEffect.TRANSITION: {
				api.start({ emissive: prevState.color, emissiveIntensity: prevState.brightness, opacity: prevState.brightness > 0 ? 1 : 0, immediate: true });
				break;
			}
		}
	}, [light.lastEventId]);

	useFrame(() => {
		const { time, duration, nextEffect, prevState, nextState } = light;

		if (nextEffect === App.BasicEventEffect.TRANSITION && duration > 0) {
			const ratio = Math.max(0, Math.min(1, (cursorPositionInBeats - time) / duration));

			const startOpacity = prevState.brightness > 0 ? 1 : 0;
			const endOpacity = nextState.brightness > 0 ? 1 : 0;

			api.start({
				emissive: lerpColor(prevState.color, nextState.color, ratio),
				emissiveIntensity: lerp(prevState.brightness, nextState.brightness, ratio),
				opacity: lerp(startOpacity, endOpacity, ratio),
				immediate: true,
			});
		}
	});

	return [spring, { color: isBloomEnabled ? "#ccc" : "#444", transparent: true }] as const;
}

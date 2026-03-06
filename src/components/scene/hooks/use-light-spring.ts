import { type SpringConfig, useSpring } from "@react-spring/three";

import { useAppSelector } from "$/store/hooks";
import { selectBloomEnabled, selectPlaying } from "$/store/selectors";
import { App } from "$/types";
import type { useLightEffect } from "./environment.hooks";

// todo: spring animations are always pre-computed, so there's no means of deterministically calculating the lighting state at a particular time (or when paused)
// we'll probably need to refactor this on a different api/framework at some point

const lightSpringConfig: SpringConfig = {
	tension: 270,
	friction: 120,
};

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
	const isPlaying = useAppSelector(selectPlaying);
	const isBloomEnabled = useAppSelector(selectBloomEnabled);

	const [spring] = useSpring(
		() => ({
			from: {
				emissive: "black",
				emissiveIntensity: 0,
				opacity: 0,
			},
			to: async (next) => {
				const { effect, color, brightness } = light;

				switch (effect) {
					case App.BasicEventEffect.FLASH: {
						await next({ emissive: color, emissiveIntensity: brightness * 1.5, opacity: 1, immediate: true });
						await next({ emissive: color, emissiveIntensity: brightness, opacity: 1, immediate: false, config: lightSpringConfig });
						break;
					}
					case App.BasicEventEffect.FADE: {
						await next({ emissive: color, emissiveIntensity: brightness * 1.5, opacity: 1, immediate: true });
						await next({ emissive: color, emissiveIntensity: 0, opacity: 0, immediate: false, config: lightSpringConfig });
						break;
					}
					case App.BasicEventEffect.TRANSITION: // todo: this will be a problem for future me to figure out
					case App.BasicEventEffect.ON: {
						await next({ emissive: color, emissiveIntensity: brightness, opacity: 1, immediate: true });
						break;
					}
					default: {
						await next({ emissive: color, emissiveIntensity: 0, opacity: 0, immediate: true });
						break;
					}
				}
			},
		}),
		[light.lastEventId, isPlaying],
	);

	return [spring, { color: isBloomEnabled ? "#ccc" : "#444", transparent: true }] as const;
}

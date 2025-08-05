import { animated, type SpringConfig, useSpring } from "@react-spring/three";
import { type ComponentProps, useMemo } from "react";

import { useOnChange } from "$/components/hooks";
import type { UseLightPropsReturn } from "$/components/scene/hooks";
import { useAppSelector } from "$/store/hooks";
import { selectBloomEnabled, selectPlaying } from "$/store/selectors";
import { App } from "$/types";

// todo: spring animations are always pre-computed, so there's no means of deterministically calculating the lighting state at a particular time (or when paused)
// we'll probably need to refactor this on a different api/framework at some point

const lightSpringConfig: SpringConfig = {
	tension: 270,
	friction: 120,
};

interface UseSpringConfigForLightOptions extends Omit<UseLightPropsReturn, "lastEventId"> {
	mult?: number;
}
function useSpringConfigForLight({ mult = 1, effect, color, brightness }: UseSpringConfigForLightOptions) {
	const opacity = brightness > 0 ? 1 : 0;
	const onEmissiveIntensity = brightness * mult;
	const brightEmissiveIntensity = brightness * 1.25 * mult;

	switch (effect) {
		case App.BasicEventEffect.OFF: {
			return {
				to: { opacity: 0, emissiveIntensity: 0 },
				immediate: true,
				reset: false,
				config: lightSpringConfig,
			};
		}
		case App.BasicEventEffect.TRANSITION: // todo: this will be a problem for future me to figure out
		case App.BasicEventEffect.ON: {
			return {
				to: { emissive: color, opacity: opacity, emissiveIntensity: onEmissiveIntensity },
				immediate: true,
				reset: false,
				config: lightSpringConfig,
			};
		}
		case App.BasicEventEffect.FLASH: {
			return {
				from: { emissive: color, opacity: opacity, emissiveIntensity: brightEmissiveIntensity },
				to: { emissive: color, opacity: opacity, emissiveIntensity: onEmissiveIntensity },
				immediate: false,
				reset: false,
				config: lightSpringConfig,
			};
		}
		case App.BasicEventEffect.FADE: {
			return {
				from: { emissive: color, opacity: opacity, emissiveIntensity: brightEmissiveIntensity },
				to: { emissive: color, opacity: 0, emissiveIntensity: 0 },
				immediate: false,
				reset: false,
				config: lightSpringConfig,
			};
		}
		default: {
			throw new Error(`Unrecognized status: ${effect}`);
		}
	}
}

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

interface UseLightSpringOptions {
	light: UseLightPropsReturn;
}
export function useLightSpring({ light }: UseLightSpringOptions) {
	const isPlaying = useAppSelector(selectPlaying);
	const lightSpringConfig = useSpringConfigForLight({ ...light });

	useOnChange(() => {
		if (!isPlaying) return;

		const statusShouldReset = light.effect === App.BasicEventEffect.FLASH || light.effect === App.BasicEventEffect.FADE;
		lightSpringConfig.reset = statusShouldReset;
	}, light.lastEventId ?? null);

	return useSpring<{ emissive: string; emissiveIntensity: number; opacity: number }>(() => lightSpringConfig, [light]);
}

export function LightMaterial({ light, ...rest }: ComponentProps<typeof animated.meshLambertMaterial> & UseLightSpringOptions) {
	const isBloomEnabled = useAppSelector(selectBloomEnabled);
	const materialColor = useMemo(() => (isBloomEnabled ? "#ccc" : "#444"), [isBloomEnabled]);

	const [spring] = useLightSpring({ light });

	return <animated.meshLambertMaterial {...rest} emissive={spring.emissive} emissiveIntensity={spring.emissiveIntensity} opacity={spring.opacity} color={materialColor} attach="material" transparent={true} />;
}

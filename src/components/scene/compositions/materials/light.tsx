import { animated, useSpring } from "@react-spring/three";
import { type ComponentProps, useMemo } from "react";
import type { ColorRepresentation } from "three";

import { useOnChange } from "$/components/hooks";
import { useAppSelector } from "$/store/hooks";
import { selectGraphicsQuality, selectIsPlaying } from "$/store/selectors";
import { App, Quality } from "$/types";

const lightSpringConfig = {
	tension: 270,
	friction: 120,
};

type LightSpringProps = { emissiveIntensity: number; opacity: number };
type LightSpringStateProps = [on: LightSpringProps, off: LightSpringProps, bright: LightSpringProps];

interface UseSpringConfigForLightOptions {
	state: LightSpringStateProps;
	status: App.LightEventType;
	color: ColorRepresentation;
}
function useSpringConfigForLight({ state: [onProps, offProps, brightProps], status }: UseSpringConfigForLightOptions) {
	const quality = useAppSelector(selectGraphicsQuality);
	const color = useMemo(() => (quality === Quality.HIGH ? "#ccc" : "#444"), [quality]);

	switch (status) {
		case App.BasicEventType.OFF: {
			return {
				to: { ...offProps, color: "#444" },
				immediate: true,
				reset: false,
				config: lightSpringConfig,
			};
		}
		case App.BasicEventType.ON: {
			return {
				to: { ...onProps, color: color },
				immediate: true,
				reset: false,
				config: lightSpringConfig,
			};
		}
		case App.BasicEventType.FLASH: {
			return {
				from: brightProps,
				to: onProps,
				immediate: false,
				reset: false,
				config: lightSpringConfig,
			};
		}
		case App.BasicEventType.FADE: {
			return {
				from: brightProps,
				to: offProps,
				immediate: false,
				reset: false,
				config: lightSpringConfig,
			};
		}
		default: {
			throw new Error(`Unrecognized status: ${status}`);
		}
	}
}

const MULT = 1.5;

const ON_PROPS = { emissiveIntensity: 1 * MULT, opacity: 1 };
const OFF_PROPS = { emissiveIntensity: 0, opacity: 0 };
const BRIGHT_PROPS = { emissiveIntensity: 1.2 * MULT, opacity: 1 };

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
	lastEventId: App.BasicEvent["id"] | null | undefined;
	status: App.LightEventType;
	color: ColorRepresentation;
	stateProps?: LightSpringStateProps;
}
export function useLightSpring({ lastEventId, status, color, stateProps = [ON_PROPS, OFF_PROPS, BRIGHT_PROPS] }: UseLightSpringOptions) {
	const isPlaying = useAppSelector(selectIsPlaying);
	const lightSpringConfig = useSpringConfigForLight({ state: stateProps, status, color });

	useOnChange(() => {
		if (!isPlaying) return;

		const statusShouldReset = status === App.BasicEventType.FLASH || status === App.BasicEventType.FADE;
		lightSpringConfig.reset = statusShouldReset;
	}, lastEventId ?? null);

	return useSpring(() => lightSpringConfig, [status]);
}

interface Props extends UseLightSpringOptions, ComponentProps<typeof animated.meshLambertMaterial> {
	color: ColorRepresentation;
}
export function LightMaterial({ lastEventId, status, color, ...rest }: Props) {
	const [spring] = useLightSpring({ lastEventId, status, color });

	return <animated.meshLambertMaterial {...rest} {...spring} attach="material" emissive={color} transparent={true} />;
}

import { App } from "$/types";

const lightSpringConfig = {
	tension: 270,
	friction: 120,
};

export function getSpringConfigForLight([onProps, offProps, brightProps]: { opacity: number }[], status: App.LightingEventType) {
	switch (status) {
		case App.EventType.OFF:
			return {
				to: offProps,
				immediate: true,
				reset: false,
				config: lightSpringConfig,
			};

		case App.EventType.ON: {
			return {
				to: onProps,
				immediate: true,
				reset: false,
				config: lightSpringConfig,
			};
		}

		case App.EventType.FLASH: {
			return {
				from: brightProps,
				to: onProps,
				immediate: false,
				reset: false,
				config: lightSpringConfig,
			};
		}

		case App.EventType.FADE: {
			return {
				from: brightProps,
				to: offProps,
				immediate: false,
				reset: false,
				config: lightSpringConfig,
			};
		}

		default:
			throw new Error(`Unrecognized status: ${status}`);
	}
}

export function findMostRecentEventInTrack<T extends App.Event>(events: App.Event[], currentBeat: number, processingDelayInBeats: number) {
	for (let i = events.length - 1; i >= 0; i--) {
		const event = events[i];
		if (event.beatNum < currentBeat + processingDelayInBeats) {
			return event as T;
		}
	}

	return null;
}

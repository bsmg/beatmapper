import { App } from "$/types";

const lightSpringConfig = {
	tension: 270,
	friction: 120,
};

export function getSpringConfigForLight([onProps, offProps, brightProps]: { opacity: number }[], status: App.LightEventType) {
	switch (status) {
		case App.BasicEventType.OFF:
			return {
				to: offProps,
				immediate: true,
				reset: false,
				config: lightSpringConfig,
			};

		case App.BasicEventType.ON: {
			return {
				to: onProps,
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

		default:
			throw new Error(`Unrecognized status: ${status}`);
	}
}

export function findMostRecentEventInTrack<T extends App.BasicEvent>(events: App.BasicEvent[], currentBeat: number, processingDelayInBeats: number) {
	for (let i = events.length - 1; i >= 0; i--) {
		const event = events[i];
		if (event.beatNum < currentBeat + processingDelayInBeats) {
			return event as T;
		}
	}

	return null;
}

import { isLightTrack, resolveEventColor, resolveEventEffect, resolveEventValue } from "$/helpers/events.helpers";
import { App, type IBackgroundBox, type IEventTrack, type Member } from "$/types";
import { sortObjectFn } from "bsmap";

const ON_EVENT_TYPES: App.BasicEventType[] = [App.BasicEventType.ON, App.BasicEventType.FLASH, App.BasicEventType.TRANSITION];

interface Options {
	initialColor: App.EventColor | null;
	initialBrightness: number | null;
	startBeat: number;
	numOfBeatsToShow: number;
	tracks?: IEventTrack[];
}
export function createBackgroundBoxes(events: App.IBasicEvent[], trackId: App.TrackId, { initialColor: initialTrackLightingColorType, initialBrightness, startBeat, numOfBeatsToShow, tracks }: Options) {
	// If this track isn't a lighting track, bail early.
	if (!isLightTrack(trackId, tracks)) return [];

	const backgroundBoxes: IBackgroundBox[] = [];

	// If the initial lighting value is true, we wanna convert it into a pseudo-event.
	// It's simpler if we treat it as an 'on' event at the very first beat of the section.
	const workableEvents = [...events.sort(sortObjectFn)] as App.IBasicEvent[];
	if (initialTrackLightingColorType) {
		const pseudoInitialEvent = {
			time: startBeat,
			type: trackId,
			value: resolveEventValue({ effect: App.BasicEventType.ON, color: initialTrackLightingColorType }, { tracks }),
			floatValue: initialBrightness ?? 1,
		} as Member<typeof workableEvents>;

		workableEvents.unshift(pseudoInitialEvent);

		// SPECIAL CASE: initially lit but with no events in the window
		if (events.length === 0) {
			const initialColorType = resolveEventColor(pseudoInitialEvent);
			backgroundBoxes.push({
				time: pseudoInitialEvent.time,
				duration: numOfBeatsToShow,
				startColor: initialColorType,
				endColor: initialColorType,
				startBrightness: pseudoInitialEvent.floatValue,
				endBrightness: pseudoInitialEvent.floatValue,
			});

			return backgroundBoxes;
		}
	}

	let tentativeBox: IBackgroundBox | null = null;

	for (const event of workableEvents) {
		const eventEffect = resolveEventEffect(event);
		const eventColor = resolveEventColor(event);

		const isOn = ON_EVENT_TYPES.includes(eventEffect) && event.floatValue > 0;

		// relevant possibilities:
		// It was off, and now it's on
		// It was on, and now it's off
		// It was red, and now it's blue (or vice versa)
		// It hasn't changed (blue -> blue, red -> red, or off -> off)

		if (!tentativeBox && isOn) {
			// 1. It was off and now it's on

			tentativeBox = {
				time: event.time,
				duration: undefined,
				startColor: eventColor,
				endColor: eventColor,
				startBrightness: event.floatValue,
				endBrightness: event.floatValue,
			};
		}

		if (tentativeBox && !isOn) {
			// 2. It was on, and now it's off
			tentativeBox.duration = event.time - tentativeBox.time;
			backgroundBoxes.push(tentativeBox);
			tentativeBox = null;
		}

		if (tentativeBox && isOn) {
			// 3. Color changed
			tentativeBox.duration = event.time - tentativeBox.time;
			if (tentativeBox.duration !== 0) backgroundBoxes.push(tentativeBox);

			tentativeBox = {
				time: event.time,
				duration: undefined,
				startColor: eventColor,
				endColor: eventColor,
				startBrightness: event.floatValue,
				endBrightness: event.floatValue,
			};
		}
	}

	// If there's still a tentative box after iterating through all events, it means that it should remain on after the current window.
	// Stretch it to fill the available space.
	if (tentativeBox) {
		const endBeat = startBeat + numOfBeatsToShow;
		const durationRemaining = endBeat - tentativeBox.time;
		tentativeBox.duration = durationRemaining;
		backgroundBoxes.push(tentativeBox);
	}

	return backgroundBoxes;
}

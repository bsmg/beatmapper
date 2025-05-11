import { isLightTrack, resolveEventColor, resolveEventEffect, resolveEventValue } from "$/helpers/events.helpers";
import { App, type IBackgroundBox, type IEventTrack, type Member } from "$/types";

const ON_EVENT_TYPES: App.BasicEventType[] = [App.BasicEventType.ON, App.BasicEventType.FLASH];

export function createBackgroundBoxes(events: App.IBasicEvent[], trackId: App.TrackId, initialTrackLightingColorType: App.EventColor | null, startBeat: number, numOfBeatsToShow: number, tracks?: IEventTrack[]) {
	// If this track isn't a lighting track, bail early.
	if (!isLightTrack(trackId, tracks)) return [];

	const backgroundBoxes: IBackgroundBox[] = [];

	// If the initial lighting value is true, we wanna convert it into a pseudo-event.
	// It's simpler if we treat it as an 'on' event at the very first beat of the section.
	const workableEvents = [...events.sort((a, b) => a.time - b.time)] as App.IBasicEvent[];
	if (initialTrackLightingColorType) {
		const pseudoInitialEvent = {
			time: startBeat,
			type: trackId,
			value: resolveEventValue({ effect: App.BasicEventType.ON, color: initialTrackLightingColorType }, { tracks }),
		} as Member<typeof workableEvents>;

		workableEvents.unshift(pseudoInitialEvent);

		// SPECIAL CASE: initially lit but with no events in the window
		if (events.length === 0) {
			const initialColorType = resolveEventColor(pseudoInitialEvent);
			backgroundBoxes.push({
				beatNum: pseudoInitialEvent.time,
				duration: numOfBeatsToShow,
				colorType: initialColorType,
			});

			return backgroundBoxes;
		}
	}

	let tentativeBox = null;

	for (const event of workableEvents) {
		const eventEffect = resolveEventEffect(event);
		const eventColor = resolveEventColor(event);

		const isOn = ON_EVENT_TYPES.includes(eventEffect);

		if (!tentativeBox && isOn) {
			// relevant possibilities:
			// It was off, and now it's on
			// It was on, and not it's off
			// It was red, and now it's blue (or vice versa)
			// It hasn't changed (blue -> blue, red -> red, or off -> off)
			// 1. It was off and now it's on
			tentativeBox = {
				beatNum: event.time,
				duration: undefined,
				colorType: eventColor,
			} as IBackgroundBox;
		}

		if (tentativeBox && !isOn) {
			// 2. It was on, and now it's off
			tentativeBox.duration = event.time - tentativeBox.beatNum;
			backgroundBoxes.push(tentativeBox);

			tentativeBox = null;
		}

		if (tentativeBox && isOn && tentativeBox.colorType !== eventColor) {
			// 3. Color changed
			tentativeBox.duration = event.time - tentativeBox.beatNum;
			backgroundBoxes.push(tentativeBox);

			tentativeBox = {
				beatNum: event.time,
				duration: undefined,
				colorType: eventColor,
			};
		}
	}

	// If there's still a tentative box after iterating through all events, it means that it should remain on after the current window.
	// Stretch it to fill the available space.
	if (tentativeBox) {
		const endBeat = startBeat + numOfBeatsToShow;
		const durationRemaining = endBeat - tentativeBox.beatNum;
		tentativeBox.duration = durationRemaining;
		backgroundBoxes.push(tentativeBox);
	}

	return backgroundBoxes;
}

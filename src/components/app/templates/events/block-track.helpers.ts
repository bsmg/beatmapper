import { isLightTrack } from "$/helpers/events.helpers";
import { App, type IBackgroundBox, type IEventTrack } from "$/types";

const ON_EVENT_TYPES: App.BasicEventType[] = [App.BasicEventType.ON, App.BasicEventType.FLASH];

export function getBackgroundBoxes(events: App.BasicEvent[], trackId: App.TrackId, initialTrackLightingColorType: App.EventColor | null, startBeat: number, numOfBeatsToShow: number, tracks?: IEventTrack[]) {
	// If this track isn't a lighting track, bail early.
	if (!isLightTrack(trackId, tracks)) return [];

	const backgroundBoxes: IBackgroundBox[] = [];

	// If the initial lighting value is true, we wanna convert it into a pseudo-event.
	// It's simpler if we treat it as an 'on' event at the very first beat of the section.
	const workableEvents = [...events.sort((a, b) => a.beatNum - b.beatNum)] as App.IBasicLightEvent[];
	if (initialTrackLightingColorType) {
		const pseudoInitialEvent = {
			id: `initial-${startBeat}-${numOfBeatsToShow}`,
			type: App.BasicEventType.ON,
			beatNum: startBeat,
			colorType: initialTrackLightingColorType,
		} as App.IBasicLightEvent;

		workableEvents.unshift(pseudoInitialEvent);

		// SPECIAL CASE: initially lit but with no events in the window
		if (events.length === 0) {
			backgroundBoxes.push({
				id: pseudoInitialEvent.id,
				beatNum: pseudoInitialEvent.beatNum,
				duration: numOfBeatsToShow,
				colorType: pseudoInitialEvent.colorType,
			});

			return backgroundBoxes;
		}
	}

	let tentativeBox = null;

	for (const event of workableEvents) {
		const isOn = ON_EVENT_TYPES.includes(event.type);

		if (!tentativeBox && isOn) {
			// relevant possibilities:
			// It was off, and now it's on
			// It was on, and not it's off
			// It was red, and now it's blue (or vice versa)
			// It hasn't changed (blue -> blue, red -> red, or off -> off)
			// 1. It was off and now it's on
			tentativeBox = {
				id: event.id,
				beatNum: event.beatNum,
				duration: undefined,
				colorType: event.colorType,
			} as IBackgroundBox;
		}

		if (tentativeBox && !isOn) {
			// 2. It was on, and now it's off
			tentativeBox.duration = event.beatNum - tentativeBox.beatNum;
			backgroundBoxes.push(tentativeBox);

			tentativeBox = null;
		}

		if (tentativeBox && isOn && tentativeBox.colorType !== event.colorType) {
			// 3. Color changed
			tentativeBox.duration = event.beatNum - tentativeBox.beatNum;
			backgroundBoxes.push(tentativeBox);

			tentativeBox = {
				id: event.id,
				beatNum: event.beatNum,
				duration: undefined,
				colorType: event.colorType,
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

import { EVENT_TRACKS } from "$/constants";
import { App, type IBackgroundBox, TrackType } from "$/types";

function getIsEventOn(ev: App.Event) {
	return ev.type === App.EventType.ON || ev.type === App.EventType.FLASH;
}

function getIsLightingTrack(trackId: App.TrackId) {
	const track = EVENT_TRACKS.find((t) => t.id === trackId);

	if (!track) {
		throw new Error(`Unrecognized trackId: ${trackId}`);
	}

	if (track.type !== TrackType.LIGHT) {
		return false;
	}

	if (track.id === App.TrackId[8] || track.id === App.TrackId[9]) {
		return false;
	}

	return true;
}

export function getBackgroundBoxes(events: App.Event[], trackId: App.TrackId, initialTrackLightingColorType: App.EventColorType | null, startBeat: number, numOfBeatsToShow: number) {
	// If this track isn't a lighting track, bail early.
	const isLightingTrack = getIsLightingTrack(trackId);
	if (!isLightingTrack) {
		return [];
	}

	const backgroundBoxes: IBackgroundBox[] = [];

	// If the initial lighting value is true, we wanna convert it into a pseudo-event.
	// It's simpler if we treat it as an 'on' event at the very first beat of the section.
	const workableEvents = [...events] as App.LightingEvent[];
	if (initialTrackLightingColorType) {
		const pseudoInitialEvent = {
			id: `initial-${startBeat}-${numOfBeatsToShow}`,
			type: App.EventType.ON,
			beatNum: startBeat,
			colorType: initialTrackLightingColorType,
		} as App.LightingEvent;

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
		const isEventOn = getIsEventOn(event);

		if (!tentativeBox && isEventOn) {
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

		if (tentativeBox && !isEventOn) {
			// 2. It was on, and now it's off
			tentativeBox.duration = event.beatNum - tentativeBox.beatNum;
			backgroundBoxes.push(tentativeBox);

			tentativeBox = null;
		}

		if (tentativeBox && isEventOn && tentativeBox.colorType !== event.colorType) {
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

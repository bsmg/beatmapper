export function getBeatNumForItem<T extends object>(item: T) {
	if ("_time" in item && typeof item._time === "number") {
		return item._time;
	}
	if ("beatStart" in item && typeof item.beatStart === "number") {
		return item.beatStart;
	}
	if ("beatNum" in item && typeof item.beatNum === "number") {
		return item.beatNum;
	}
	throw new Error("Could not determine time for event");
}

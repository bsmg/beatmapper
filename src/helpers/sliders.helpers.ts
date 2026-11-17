import type { IWrapArc, IWrapBaseSlider, IWrapChain } from "bsmap";

export function isArc(data: unknown): data is IWrapArc {
	if (typeof data !== "object" || !data) return false;
	return "midAnchor" in data;
}
export function isChain(data: unknown): data is IWrapChain {
	if (typeof data !== "object" || !data) return false;
	return "sliceCount" in data;
}

export function resolveSliderId<T extends Pick<IWrapBaseSlider, "time" | "posX" | "posY" | "tailTime" | "tailPosX" | "tailPosY">>(x: T) {
	let baseId = `${x.time}/${x.posX}/${x.posY}`;
	if (isArc(x)) baseId += `/${x.tailTime}/${x.tailPosX}/${x.tailPosY}/${x.lengthMultiplier}/${x.tailLengthMultiplier}`;
	return baseId;
}

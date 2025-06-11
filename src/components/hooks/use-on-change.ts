import { type EffectCallback, useRef } from "react";

export function useOnChange<T extends string | number>(callback: EffectCallback, id: T | null) {
	const cachedId = useRef(id);

	const idChanged = id !== cachedId.current;

	if (idChanged) {
		callback();

		cachedId.current = id;
	}
}

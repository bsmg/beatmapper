import type { DeepPartial } from "bsmap";

export function isObjectEmpty<T extends object>(obj: T) {
	for (const key in obj) {
		if (Object.hasOwn(obj, key) && obj[key] !== undefined) return false;
	}
	return true;
}

export function ensureObject<T extends object>(object: T) {
	return !isObjectEmpty(object) ? object : undefined;
}

export function hasKeys<T extends object, K extends keyof Required<T>>(obj: T, ...keys: K[]): boolean {
	for (const key of keys) {
		if (Object.hasOwn(obj, key) && obj[key]) return true;
	}
	return false;
}

function isAssignable(item: unknown): item is Record<string, unknown> {
	return !!(item && typeof item === "object" && !Array.isArray(item));
}
// biome-ignore lint/suspicious/noExplicitAny: valid use case
export function deepAssign<T extends Record<string, any>>(target: T, ...sources: DeepPartial<T>[]): T {
	const output: Record<string, unknown> = { ...target };

	for (const source of sources) {
		if (!isAssignable(source)) continue;

		for (const key of Object.keys(source)) {
			const sourceValue = source[key];
			if (sourceValue === undefined) continue;

			const targetValue = output[key];

			if (Array.isArray(sourceValue)) {
				output[key] = [...sourceValue];
			} else if (isAssignable(sourceValue) && isAssignable(targetValue)) {
				output[key] = deepAssign(targetValue, sourceValue);
			} else {
				output[key] = sourceValue;
			}
		}
	}

	return output as T;
}

import type { DeepPartial } from "bsmap/types";

export { omit } from "@std/collections/omit";
export { pick } from "@std/collections/pick";

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
		if (Object.hasOwn(obj, key)) return true;
	}
	return false;
}

function isAssignable(item: unknown): item is Record<string, any> {
	return !!(item && typeof item === "object" && !Array.isArray(item));
}

export function deepAssign<T extends Record<string, any>>(target: T, ...sources: NoInfer<DeepPartial<T>>[]): T {
	if (!sources.length) return target;

	const source = sources.shift() as NoInfer<DeepPartial<T>> | undefined;

	if (source === undefined) return target;

	let output: T = { ...target };

	if (isAssignable(target) && isAssignable(source)) {
		const mergeSource = source as Record<string, any>;
		for (const key in mergeSource) {
			if (Object.hasOwn(mergeSource, key)) {
				if (key in output && isAssignable(output[key])) {
					const targetValue = output[key] as T[Extract<keyof T, typeof key>];
					const sourceValue = mergeSource[key] as DeepPartial<T[Extract<keyof T, typeof key>]>;
					output = { ...output, [key]: deepAssign(targetValue, sourceValue) };
				} else {
					if (mergeSource[key] !== undefined) {
						output = { ...output, [key]: mergeSource[key] };
					}
				}
			}
		}
	}

	return deepAssign(output, ...sources);
}

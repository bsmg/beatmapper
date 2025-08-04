import type { DeepPartial } from "bsmap/types";

export function isObjectEmpty<T extends object>(obj: T) {
	for (const key in obj) {
		if (Object.hasOwn(obj, key) && obj[key] !== undefined) return false;
	}
	return true;
}

export function ensureObject<T extends object>(object: T) {
	return !isObjectEmpty(object) ? object : undefined;
}

export function pick<T extends object, K extends keyof T>(obj: T, ...keys: readonly K[]): Pick<T, K> {
	const result = {} as T;
	for (const key of keys) {
		if (key in obj) {
			result[key] = obj[key];
		}
	}
	return result;
}

export function omit<T extends object, K extends keyof T>(obj: T, ...keys: readonly K[]): Omit<T, K> {
	const result = obj;
	for (const key of keys) {
		if (key in obj) {
			delete result[key];
		}
	}
	return result;
}

export function hasKeys<T extends object, K extends keyof Required<T>>(obj: T, ...keys: K[]): boolean {
	for (const key of keys) {
		if (Object.hasOwn(obj, key)) return true;
	}
	return false;
}

export function extractTypeFromObject<T extends object, K extends keyof object>(obj: T, type: K) {
	const entries = Object.entries(obj) as [keyof T, T][];
	return entries.reduce(
		(acc: Record<keyof T, T>, [key, val]) => {
			// biome-ignore lint/suspicious/useValidTypeof: valid usage
			if (typeof val === type) {
				acc[key] = val;
			}
			return acc;
		},
		{} as Record<keyof T, T>,
	);
}

function shallowCompareWithKeys<T extends object, K extends keyof T>(o1: T, o2: T, keys: K[]) {
	return !keys.find((key) => {
		return o1[key] !== o2[key];
	});
}

/**
 * Compare 1-level deep in objects. Returns true if the items are identical
 */
export function shallowCompare<T extends object, K extends keyof T>(o1: T, o2: T, keys: K[]) {
	if (keys) {
		return shallowCompareWithKeys(o1, o2, keys);
	}

	// If no keys are provided, we need to derive them
	const o1Keys = Object.keys(o1) as K[];
	const o2Keys = Object.keys(o2) as K[];

	return shallowCompareWithKeys(o1, o2, o1Keys) || shallowCompareWithKeys(o1, o2, o2Keys);
}

export function hasPropChanged<T extends object, K extends keyof T>(oldProps: Readonly<T>, newProps: T, key: K) {
	return oldProps[key] !== newProps[key];
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
			if (Object.prototype.hasOwnProperty.call(mergeSource, key)) {
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

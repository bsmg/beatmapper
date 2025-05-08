import { isEmpty } from "./guards";

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

export function withKeys<T extends object, K extends keyof Required<T>>(obj: T, ...keys: K[]): boolean {
	return keys.some((key) => key in obj && !!obj[key]);
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

export function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
	function isMergeableObject(item: unknown): item is object {
		return !!(item && typeof item === "object" && !Array.isArray(item));
	}
	if (!sources.length) return target;
	const source = sources.shift();
	if (source === undefined) return target;
	let output = target;
	if (isMergeableObject(target) && isMergeableObject(source)) {
		for (const key in source) {
			if (isMergeableObject(source[key])) {
				if (!(key in target)) output = { ...target, [key]: source[key] };
				else output = { ...target, [key]: deepMerge<T[keyof T]>(target[key], source[key]) };
			} else {
				if (source[key] !== undefined) output = { ...target, [key]: source[key] };
			}
		}
	}
	return deepMerge(output, ...sources);
}

export function maybeObject<T extends object>(object: T) {
	return !isEmpty(object) ? object : undefined;
}

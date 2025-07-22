import type { DeepPartial } from "bsmap/types";
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

export function deepMerge<T extends Record<string, any>>(target: T, ...sources: (NoInfer<DeepPartial<T>> | { overwrite?: boolean })[]): T {
	function isMergeableObject(item: unknown): item is Record<string, any> {
		return !!(item && typeof item === "object" && !Array.isArray(item));
	}

	const overwriteFlag = typeof sources[sources.length - 1] === "object" && "overwrite" in (sources[sources.length - 1] as any) ? (sources.pop() as { overwrite: boolean }).overwrite : false;

	if (!sources.length) return target;

	const source = sources.shift() as NoInfer<DeepPartial<T>> | undefined;

	if (source === undefined) return target;

	let output: T = { ...target };

	if (isMergeableObject(target) && isMergeableObject(source)) {
		const mergeSource = source as Record<string, any>;
		for (const key in mergeSource) {
			if (Object.prototype.hasOwnProperty.call(mergeSource, key)) {
				if (key in output && isMergeableObject(output[key])) {
					const targetValue = output[key] as T[Extract<keyof T, typeof key>];
					const sourceValue = mergeSource[key] as DeepPartial<T[Extract<keyof T, typeof key>]>;
					output = { ...output, [key]: deepMerge(targetValue, sourceValue, { overwrite: overwriteFlag }) };
				} else {
					if (overwriteFlag || mergeSource[key] !== undefined) {
						output = { ...output, [key]: mergeSource[key] };
					}
				}
			}
		}
	}
	return deepMerge(output, ...sources);
}

export function maybeObject<T extends object>(object: T) {
	return !isEmpty(object) ? object : undefined;
}

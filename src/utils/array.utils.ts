import type { ArrayPredicate } from "$/types";
import { uniqPredicate } from "./predicates";

export function sample<T>(arr: T[]) {
	return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffle<T>(arr: T[]) {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

/**
 * 1D flatten. Uses native Array#flat when available.
 */
export function flatten<T>(list: T[]): (T extends readonly (infer InnerArr)[] ? InnerArr : T)[] {
	return list.flat();
}

export function convertArrayToMap<T extends { id: PropertyKey }>(list: T[]) {
	return list.reduce((acc: Record<PropertyKey, T>, item) => {
		acc[item.id] = item;
		return acc;
	}, {});
}

export function uniq<T>(arr: T[]) {
	return arr.filter(uniqPredicate);
}

// Either removes or adds an item to an array
// EXAMPLE: toggleInArray([1, 2], 3) -> [1, 2, 3]
// EXAMPLE: toggleInArray([1, 2], 2) -> [1]
export function toggleInArray<T>(arr: T[], item: T) {
	return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
}

// Combines 2 arrays, removing duplicates.
// EXAMPLE: mergeUnique([1, 2], [2, 3]) -> [1, 2, 3]
export function mergeUnique<T>(arr1: T[], arr2: T[]) {
	return arr1.concat(arr2.filter((item) => arr1.indexOf(item) === -1));
}

export function findUniquesWithinArrays<T>(arr1: T[], arr2: T[]) {
	const uniques = [];

	for (const item of arr1) {
		if (!arr2.includes(item)) {
			uniques.push(item);
		}
	}
	for (const item of arr2) {
		if (!arr1.includes(item)) {
			uniques.push(item);
		}
	}

	return uniques;
}

export function findRight<T>(arr: T[], predicate: ArrayPredicate<T, boolean>) {
	return arr.slice().reverse().find(predicate);
}

export function interleave<T, S extends string>(arr: T[], delimiter: S) {
	return arr.reduce((acc: (T | S)[], item, index) => {
		const isLastItem = index === arr.length - 1;
		if (isLastItem) {
			return acc.concat(item);
		}

		return acc.concat(item, delimiter);
	}, []);
}

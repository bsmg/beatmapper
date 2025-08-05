export function isArrayEmpty<T>(obj: T[]) {
	return obj.length === 0;
}

export function ensureArray<T>(obj: Iterable<T> | ArrayLike<T>): T[] | undefined {
	const array = Array.from(obj);
	return !isArrayEmpty(array) ? array : undefined;
}

export function difference<T>(arr1: T[], arr2: T[]) {
	const uniques: T[] = [];

	const setA = new Set(arr1);
	const setB = new Set(arr2);

	for (const item of arr1) {
		if (!setB.has(item)) uniques.push(item);
	}
	for (const item of arr2) {
		if (!setA.has(item)) uniques.push(item);
	}

	return uniques;
}

export function cycle<T>(arr: T[], current: T, step = 1) {
	const index = arr.indexOf(current);
	const newIndex = (index + step) % arr.length;
	return arr[newIndex >= 0 ? newIndex : newIndex + arr.length];
}

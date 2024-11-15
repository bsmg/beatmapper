export function isEmpty<T extends object>(obj: T) {
	return Object.keys(obj).length === 0;
}

export function isStrictlyEqual<T extends string | number | boolean | object | null>(a: T, b: T): boolean {
	if (a === b) return true;
	if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
	if (!a || !b || (typeof a !== "object" && typeof b !== "object")) return a === b;
	const keys = Object.keys(a);
	if (keys.length !== Object.keys(b).length) return false;
	if (typeof a === "object" && typeof b === "object") return keys.every((k) => isStrictlyEqual(a[k as keyof object] as T, b[k as keyof object] as T));
	return false;
}

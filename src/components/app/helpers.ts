import { View } from "$/types";

export function getHotkeyScopes(...rest: (string | undefined)[]): string[] {
	const scopes = new Set(rest);

	for (const scope of rest) {
		if (!scope) break;
		if (Object.values<string>(View).includes(scope)) {
			scopes.add("editor");
			scopes.add(scope);
		}
	}

	return Array.from(scopes).filter((x) => !!x) as string[];
}

export function getHotkeyCategory(scopes: string[]): string | undefined {
	if (scopes.includes(View.BEATMAP)) {
		return "Beatmap View";
	}
	if (scopes.includes(View.LIGHTSHOW)) {
		return "Lightshow View";
	}
	if (scopes.includes("navigation")) {
		return "Navigation";
	}
	if (scopes.includes("camera")) {
		return "Camera";
	}
	return undefined;
}

export function getDynamicInputValue<T, K extends keyof T>(items: T[] | undefined, key: K): T[K] | null {
	if (!items || items.length === 0) return null;
	const firstValue = items[0][key];
	return items.every((item) => item[key] === firstValue) && firstValue !== undefined ? firstValue : null;
}
export function cleanObjectData<T extends Record<string, unknown>>(obj: T): Partial<{ [key in keyof T]: NonNullable<T[key]> }> {
	return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null)) as Partial<{ [key in keyof T]: NonNullable<T[key]> }>;
}

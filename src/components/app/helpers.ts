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

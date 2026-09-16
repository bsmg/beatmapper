import type { View } from "$/types";

export function getScopes(view?: View): string[] {
	return view ? ["editor", view] : ["editor"];
}

import { type Token, token } from "$:styled-system/tokens";

export function getComputedToken(variable: Token) {
	let value = getComputedStyle(document.documentElement).getPropertyValue(token.var(variable).replace("var(", "").replace(")", ""));

	while (value.startsWith("var(")) {
		const referencedVarName = value.slice(4, value.length - 1);
		value = getComputedStyle(document.documentElement).getPropertyValue(referencedVarName);
	}

	return value.trim();
}

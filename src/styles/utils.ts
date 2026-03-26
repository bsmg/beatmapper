import type { Recursive, Token } from "@pandacss/types";

export function defineDynamicTokens<TValue extends PropertyKey, TToken>(arr: TValue[], map: (value: TValue) => Token<TToken> | Recursive<Token<TToken>>) {
	return arr.reduce(
		(acc, value) => {
			acc[value] = map(value) as Token<TToken> | Recursive<Token<TToken>>;
			return acc;
		},
		{} as Record<TValue, Token<TToken> | Recursive<Token<TToken>>>,
	);
}

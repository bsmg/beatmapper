export function pluralize(num: number, singular: string, plural?: string): string {
	if (num === 1) return singular;
	return plural || `${singular}s`;
}

export function hashCode(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	return hash;
}

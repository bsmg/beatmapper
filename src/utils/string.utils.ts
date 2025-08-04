export { slugify } from "@std/text/unstable-slugify";

export function pluralize(num: number, singular: string, plural?: string): string {
	if (num === 1) return singular;
	return plural || `${singular}s`;
}

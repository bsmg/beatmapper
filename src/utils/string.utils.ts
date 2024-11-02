export function capitalize(str: string) {
	return str[0].toUpperCase() + str.slice(1);
}

export function hyphenate(str: string) {
	return str.replace(/([A-Z])/g, "-$1").toLowerCase();
}

// VERY naive pluralize
export function pluralize(num: number, string: string) {
	const noun = num === 1 ? string : `${string}s`;

	return `${num} ${noun}`;
}

export function slugify(str: string) {
	return (
		String(str)
			.normalize("NFKD")
			// biome-ignore lint/suspicious/noMisleadingCharacterClass: necessary
			.replace(/[\u0300-\u036f]/g, "")
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9 -]/g, "")
			.replace(/\s+/g, "-")
	);
}

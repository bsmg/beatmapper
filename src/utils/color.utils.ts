export function convertHexToRGBA(hex: string, alpha = 1) {
	const r = Number.parseInt(hex.slice(1, 3), 16);
	const g = Number.parseInt(hex.slice(3, 5), 16);
	const b = Number.parseInt(hex.slice(5, 7), 16);

	return { r, g, b, alpha };
}

export function isColorDark(hexColor: string): boolean {
	const { r, g, b } = convertHexToRGBA(hexColor);
	// Calculate luminance using the relative luminance formula
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	// Consider the color dark if the luminance is below a threshold (e.g., 0.5)
	return luminance < 0.5;
}

export function getYForSpeed(height: number, speed: number) {
	const divisionHeight = height / 8;
	return height - speed * divisionHeight;
}

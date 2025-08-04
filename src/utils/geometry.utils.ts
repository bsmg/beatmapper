type Vector2Tuple = [number, number];
type Vector2Like = { x: number; y: number };

export function getDistanceBetweenPoints<T extends Vector2Like | Vector2Tuple>(p1: T, p2: T) {
	// Support both object form {x: x, y: y} and array form [x, y]
	const x1 = Array.isArray(p1) ? p1[0] : p1.x;
	const y1 = Array.isArray(p1) ? p1[1] : p1.y;
	const x2 = Array.isArray(p2) ? p2[0] : p2.x;
	const y2 = Array.isArray(p2) ? p2[1] : p2.y;

	const deltaX = Math.abs(x2 - x1);
	const deltaY = Math.abs(y2 - y1);

	return Math.sqrt(deltaX ** 2 + deltaY ** 2);
}

export function convertRadiansToDegrees(angle: number) {
	return (angle * 180) / Math.PI;
}
export function convertDegreesToRadians(angle: number) {
	return (angle * Math.PI) / 180;
}

export function getQuadrantForPoint({ x, y }: Vector2Like) {
	if (x >= 0 && y >= 0) {
		return 1;
	}
	if (x < 0 && y >= 0) {
		return 2;
	}
	if (x < 0 && y < 0) {
		return 3;
	}
	if (x >= 0 && y < 0) {
		return 4;
	}
	throw new Error(`Invalid coordinates: ${x} and ${y}`);
}

export function convertCartesianToPolar<T extends Vector2Like>(point: T, centerPoint: T) {
	const pointRelativeToCenter = {
		x: point.x - centerPoint.x,
		y: point.y - centerPoint.y,
	};

	const { x, y } = pointRelativeToCenter;

	// When going from cartesian to polar, it struggles with negative numbers.
	// We need to take quadrants into account!
	const quadrant = getQuadrantForPoint(pointRelativeToCenter);

	let radiansOffset = 0;
	if (quadrant === 2 || quadrant === 3) {
		radiansOffset += Math.PI;
	} else if (quadrant === 4) {
		radiansOffset += 2 * Math.PI;
	}

	const radius = Math.sqrt(x ** 2 + y ** 2);
	const theta = Math.atan(y / x) + radiansOffset;

	return [theta, radius];
}

export function convertPolarToCartesian([θ, radius]: Vector2Tuple) {
	const x = radius * Math.cos(θ);
	const y = radius * Math.sin(θ);

	return [x, y];
}

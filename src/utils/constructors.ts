export function range(a: number, b?: number, step = 1) {
	let [start, stop] = [a, b];
	if (typeof stop === "undefined") {
		// one param defined
		stop = start;
		start = 0;
	}

	if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
		return [];
	}

	const result = [];
	for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
		result.push(i);
	}

	return result;
}

export function random(min: number, max: number) {
	return Math.floor(Math.random() * (max - min)) + min;
}

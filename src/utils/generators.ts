export function* range(a: number, b?: number, step = 1): Generator<number> {
	const [start, stop] = b === undefined ? [0, a] : [a, b + 1];

	for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
		yield i;
	}
}

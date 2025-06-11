export function compose<T extends (...args: any[]) => void>(...fns: T[]) {
	return fns.reduceRight(
		(prevFn, nextFn) =>
			(...args: Parameters<typeof prevFn>) =>
				nextFn(prevFn(...args)),
		(value: unknown) => value,
	);
}

// TODO: this will eventually become native when ES2024 is supported in TS 5.7
export function withResolvers<T>() {
	let resolve!: (value: T | PromiseLike<T>) => void;
	let reject!: (reason?: any) => void;
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
}

export function tryYield<T, TReturn, TNext, Resultant>(generator: Generator<T, TReturn, TNext>, onResolved: (x: T) => Resultant): Promise<Resultant>;
export function tryYield<T, TReturn, TNext, Resultant, RejectedResult>(generator: Generator<T, TReturn, TNext>, onResolved: (x: T) => Resultant, onRejected: (e: any) => RejectedResult): Promise<Resultant | RejectedResult>;
export function tryYield<T, TReturn, TNext, Resultant, RejectedResult = never>(generator: Generator<T, TReturn, TNext>, onResolved: (x: T) => Resultant, onRejected?: (e: any) => RejectedResult): Promise<Resultant | RejectedResult> {
	const promise = new Promise<T>((resolve, reject) => {
		try {
			const iteratorResult = generator.next();
			if (iteratorResult.done) {
				reject(new Error("Generator completed without yielding a value"));
			} else {
				resolve(iteratorResult.value);
			}
		} catch (error) {
			reject(error);
		}
	});
	return promise.then(onResolved).catch((error) => {
		// If onRejected is provided, its result becomes the resolved value
		if (onRejected) return onRejected(error);
		throw error; // If no onRejected, re-throw to keep the promise rejected
	});
}

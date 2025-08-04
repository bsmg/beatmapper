// TODO: this will become native once the app targets ES2024
export function withResolvers<T>() {
	let resolve!: (value: T | PromiseLike<T>) => void;
	let reject!: (reason?: any) => void;
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
}

export function yieldValue<T, TReturn, TNext, Resultant, RejectedResult = never>(generator: Generator<T, TReturn, TNext>, onResolved: (x: T) => Resultant, onRejected?: (e: any) => RejectedResult): Promise<Resultant | RejectedResult> {
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

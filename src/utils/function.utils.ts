export function createLazySingleton<T, TArgs extends unknown[]>(factory: (...args: TArgs) => T) {
	let instance: T | null = null;

	return {
		setup(...args: TArgs): T {
			if (instance === null) {
				instance = factory(...args);
			}
			return instance;
		},
		get(): T {
			if (instance === null) {
				throw new Error("Cannot access instance. Ensure setup() is called at the top of the call stack.");
			}
			return instance;
		},
		destroy() {
			instance = null;
		},
	};
}

// TODO: this will become native once the app targets ES2024
export function withResolvers<T>() {
	let resolve!: (value: T | PromiseLike<T>) => void;
	let reject!: (reason?: unknown) => void;
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
}

export function yieldValue<T, TReturn, TNext>(generator: Generator<T, TReturn, TNext>): Promise<T> {
	return new Promise<T>((resolve, reject) => {
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
}

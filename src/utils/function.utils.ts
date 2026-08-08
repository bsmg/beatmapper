export function createSingleton<T, TArgs extends unknown[]>(factory: (...args: TArgs) => T) {
	let instance: Awaited<T> | null = null;

	type InferGetter<T> = T extends Promise<infer X> ? Promise<() => Awaited<X>> : () => Awaited<T>;

	function get(): Awaited<T> {
		if (instance === null) {
			throw new Error("Cannot access instance. Ensure setup() is called at the top of the call stack.");
		}
		return instance;
	}
	return {
		get instance(): Awaited<T> {
			return get();
		},
		setup(...args: TArgs): InferGetter<T> {
			if (instance !== null) {
				throw new Error("Service has already been set up. Call destroy() first if re-initialization is required.");
			}
			const result = factory(...args);

			if (result instanceof Promise) {
				return result.then((resolvedInstance) => {
					instance = resolvedInstance;
					return get;
				}) as InferGetter<T>;
			}

			instance = result as Awaited<T>;
			return get as InferGetter<T>;
		},
		destroy(): void {
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

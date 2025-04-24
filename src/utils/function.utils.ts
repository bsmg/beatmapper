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

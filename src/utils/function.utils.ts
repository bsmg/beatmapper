export function debounce<T extends (...args: any[]) => void>(callback: T, wait: number | undefined, timeoutId?: NodeJS.Timeout) {
	let lastRan = timeoutId;
	const debounceFn = (...args: Parameters<typeof callback>) => {
		window.clearTimeout(timeoutId);

		lastRan = setTimeout(() => {
			callback.apply(null, args);
		}, wait);
	};

	debounceFn.cancel = () => window.clearTimeout(lastRan);

	return debounceFn;
}

export function compose<T extends (...args: any[]) => void>(...fns: T[]) {
	return fns.reduceRight(
		(prevFn, nextFn) =>
			(...args: Parameters<typeof prevFn>) =>
				nextFn(prevFn(...args)),
		(value: unknown) => value,
	);
}

export function throttle<T extends (...args: any[]) => void>(func: T, limit: number) {
	let lastFunc: string | number | NodeJS.Timeout | undefined;
	let lastRan: number;
	return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
		if (!lastRan) {
			func.apply(this, args);
			lastRan = Date.now();
		} else {
			clearTimeout(lastFunc);
			lastFunc = setTimeout(
				() => {
					if (Date.now() - lastRan >= limit) {
						func.apply(this, args);
						lastRan = Date.now();
					}
				},
				limit - (Date.now() - lastRan),
			);
		}
	};
}

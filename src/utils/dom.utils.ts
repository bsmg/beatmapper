export function requestAnimationFramePromise() {
	return new Promise((resolve) => window.requestAnimationFrame(resolve));
}

export function setTimeoutPromise(duration: number | undefined) {
	return new Promise((resolve) => window.setTimeout(resolve, duration));
}

export function deleteCookie(key: string | number | boolean) {
	document.cookie = `${encodeURIComponent(key)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function delay(duration: number | undefined) {
	return new Promise((resolve) => window.setTimeout(resolve, duration));
}

export function smoothScrollTo(selector: Parameters<typeof document.querySelector>[0]) {
	const elem = document.querySelector(selector);
	if (!elem) throw new Error("Could not find element");

	window.requestAnimationFrame(() => {
		const verticalOffset = elem.getBoundingClientRect().top;

		window.scrollTo({
			top: verticalOffset + window.pageYOffset,
			left: 0,
			behavior: "smooth",
		});
	});
}

function getIsMac(navigator?: Navigator) {
	if (!navigator) return false;
	return !navigator.userAgent.includes("Win");
}

export function isMetaKeyPressed<T extends KeyboardEvent | MouseEvent>(ev: T, navigator?: Navigator) {
	// On windows, we want to listen for the Control key.
	// On Mac, it's ⌘ (command).
	return getIsMac(navigator) ? ev.metaKey : ev.ctrlKey;
}

export function getMetaKeyLabel(navigator?: Navigator) {
	return getIsMac(navigator) ? "⌘" : "ctrl";
}
export function getOptionKeyLabel(navigator?: Navigator) {
	return getIsMac(navigator) ? "⌥" : "alt";
}

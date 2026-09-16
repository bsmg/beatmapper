declare global {
	interface Navigator {
		userAgentData?: { platform: string };
	}
}
export function isMac(nav: Navigator = navigator): boolean {
	return /mac|iphone|ipad|ipod/i.test(navigator.userAgentData?.platform ?? nav.platform ?? nav.userAgent ?? "");
}

export function isModKeyPressed<T extends KeyboardEvent | MouseEvent>(ev: T, navigator?: Navigator) {
	// On windows, we want to listen for the Control key.
	// On Mac, it's ⌘ (command).
	return isMac(navigator) ? ev.metaKey : ev.ctrlKey;
}

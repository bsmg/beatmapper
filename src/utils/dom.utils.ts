function isMac(navigator?: Navigator) {
	if (!navigator) return false;
	return !navigator.userAgent.includes("Win");
}

export function isMetaKeyPressed<T extends KeyboardEvent | MouseEvent>(ev: T, navigator?: Navigator) {
	// On windows, we want to listen for the Control key.
	// On Mac, it's ⌘ (command).
	return isMac(navigator) ? ev.metaKey : ev.ctrlKey;
}

export function getMetaKeyLabel(navigator?: Navigator) {
	return isMac(navigator) ? "⌘" : "CTRL";
}
export function getOptionKeyLabel(navigator?: Navigator) {
	return isMac(navigator) ? "⌥" : "ALT";
}

import { isApple } from "@zag-js/dom-query";

export function isModKeyPressed<T extends KeyboardEvent | MouseEvent>(ev: T) {
	// On windows, we want to listen for the Control key.
	// On Mac, it's ⌘ (command).
	return isApple() ? ev.metaKey : ev.ctrlKey;
}

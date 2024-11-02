import { type EffectCallback, useEffect } from "react";

/**
 * ~~~ WARNING ~~~
 * This hook is almost never a good idea. Generally, you don't want to think
 * in terms of updates and reacting to value changes, and NOT in terms of
 * mounting and unmounting.
 *
 * And yet, there are times this mindset is the right one. For example, side-
 * effects around route changes. Components mount/unmount when routes change,
 * but the route-changing state isn't available to us, so we have to think
 * in terms of mounting.
 *
 * Use with caution.
 */
export function useMount(callback: EffectCallback) {
	useEffect(callback, []);
}

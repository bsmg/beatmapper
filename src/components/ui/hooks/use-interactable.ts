import { type KeyboardEvent, type MouseEvent, useCallback } from "react";

export interface UseInteractableOptions {
	unfocusOnPress?: boolean;
}
export function useInteractable({ unfocusOnPress }: UseInteractableOptions) {
	const handlePress = useCallback(
		(event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => {
			if (unfocusOnPress) event.currentTarget.blur();
		},
		[unfocusOnPress],
	);

	return { handlePress };
}

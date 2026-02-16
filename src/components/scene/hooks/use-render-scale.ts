import { useMemo } from "react";

import { useAppSelector } from "$/store/hooks";
import { selectRenderScale } from "$/store/selectors";

export function useRenderScale(value: number) {
	const renderScale = useAppSelector(selectRenderScale);

	return useMemo(() => Math.ceil(value * renderScale), [value, renderScale]);
}

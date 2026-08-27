import { type Action, isFluxStandardAction } from "@reduxjs/toolkit";

export function withFluxStandardMeta<TMeta extends object>(condition: (meta: object) => boolean) {
	return <TAction extends Action>(action: unknown): action is TAction & { meta: TMeta } => {
		if (!isFluxStandardAction(action)) return false;
		return "meta" in action && typeof action.meta === "object" && action.meta !== null && action.meta !== undefined && condition(action.meta);
	};
}

import type { MakeRouteMatch, Register, RouteIds } from "@tanstack/react-router";

export function createRouteSelector<TFrom extends RouteIds<Register["router"]["routeTree"]>, T>(options: { from: TFrom; selector: (route: MakeRouteMatch<Register["router"]["routeTree"], TFrom>) => T }) {
	return (router: Register["router"]) => {
		const match = router.state.matches.find((m) => m.routeId === options.from);

		if (!match) {
			throw new Error(`Tried to access state from unmatched route: ${options.from}`);
		}
		return options.selector(match as unknown as MakeRouteMatch<Register["router"]["routeTree"], TFrom>);
	};
}

export const selectActiveSongId = createRouteSelector({
	from: "/_/edit/$sid/$bid/_",
	selector: ({ params }) => params.sid,
});
export const selectActiveBeatmapId = createRouteSelector({
	from: "/_/edit/$sid/$bid/_",
	selector: ({ params }) => params.bid,
});
export const selectActiveView = createRouteSelector({
	from: "/_/edit/$sid/$bid/_",
	selector: ({ context }) => context.view,
});

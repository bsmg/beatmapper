import { createRouter, useParams, type MakeRouteMatch, type Register, type RouteIds } from "@tanstack/react-router";

import ErrorBoundary from "./components/app/templates/error-boundary";
import PendingBoundary from "./components/app/templates/pending-boundary";
import { routeTree } from "./routeTree.gen";
import { createLazySingleton } from "./utils";

export const { get: getRouter, setup: setupRouter } = createLazySingleton(() => {
	return createRouter({
		routeTree: routeTree,
		defaultPendingComponent: PendingBoundary,
		defaultErrorComponent: ErrorBoundary,
	});
});

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}

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

useParams;

import { createRouter } from "@tanstack/react-router";

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

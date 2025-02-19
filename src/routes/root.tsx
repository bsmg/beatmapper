import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Fragment } from "react";

import { useAppSelector } from "$/store/hooks";
import { selectInitialized } from "$/store/selectors";

import LoadingScreen from "$/components/legacy/LoadingScreen";

export const Route = createRootRoute({
	component: RootComponent,
});

function RootComponent() {
	const hasInitialized = useAppSelector(selectInitialized);

	if (!hasInitialized) {
		return <LoadingScreen />;
	}

	return (
		<Fragment>
			<Outlet />
			<TanStackRouterDevtools position="top-right" />
		</Fragment>
	);
}

import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Fragment } from "react";

import { useAppSelector } from "$/store/hooks";
import { selectInitialized } from "$/store/selectors";

import GlobalStyles from "$/components/GlobalStyles";
import LoadingScreen from "$/components/LoadingScreen";

import "react-tippy/dist/tippy.css";

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
			<GlobalStyles />
			<TanStackRouterDevtools position="top-right" />
		</Fragment>
	);
}

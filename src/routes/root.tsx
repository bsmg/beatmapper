import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Fragment } from "react";

import { useAppSelector } from "$/store/hooks";
import { selectInitialized } from "$/store/selectors";

import { APP_TOASTER } from "$/components/app/constants";
import { PendingBoundary } from "$/components/app/layouts";
import { Toaster } from "$/components/ui/compositions";

export const Route = createRootRoute({
	component: RootComponent,
});

function RootComponent() {
	const hasInitialized = useAppSelector(selectInitialized);

	if (!hasInitialized) {
		return <PendingBoundary />;
	}

	return (
		<Fragment>
			<Outlet />
			<Toaster toaster={APP_TOASTER} />
			<TanStackRouterDevtools position="top-right" />
		</Fragment>
	);
}

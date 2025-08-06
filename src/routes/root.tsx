import { createRootRoute, HeadContent, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Fragment } from "react";

import { APP_TOASTER } from "$/components/app/constants";
import { Toaster } from "$/components/ui/compositions";
import { store } from "$/setup";
import { selectInitialized } from "$/store/selectors";

export const Route = createRootRoute({
	component: RootComponent,
	loader: async () => {
		const state = store.getState();
		return await Promise.resolve(selectInitialized(state));
	},
	head: () => {
		return { meta: [{ title: "Beatmapper" }] };
	},
});

function RootComponent() {
	return (
		<Fragment>
			<HeadContent />
			<Outlet />
			<Toaster toaster={APP_TOASTER} />
			{import.meta.env.DEV && <TanStackRouterDevtools position="top-right" />}
		</Fragment>
	);
}

import { registerSW } from "virtual:pwa-register";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import { ErrorBoundary, PendingBoundary } from "$/components/app/layouts";
import { APP_TOASTER } from "./components/app/constants";
import { routeTree } from "./routeTree.gen";
import { store } from "./setup";

import "./index.css";

const root = document.getElementById("root");
if (!root) throw new Error("No root element.");

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

export const router = createRouter({
	routeTree: routeTree,
	defaultPendingComponent: PendingBoundary,
	defaultErrorComponent: ErrorBoundary,
});

const queryClient = new QueryClient();

createRoot(root).render(
	<Provider store={store}>
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
		</QueryClientProvider>
	</Provider>,
);

const updateSW = registerSW({
	onNeedRefresh() {
		return APP_TOASTER.create({
			id: "pwa-update",
			type: "loading",
			title: "New Update Available",
			description: "A new update is available! Click the button to reload the app and move to the new update.",
			action: {
				label: "Reload",
				onClick: () => {
					updateSW(true);
				},
			},
		});
	},
	onOfflineReady() {
		return APP_TOASTER.create({
			id: "offline-ready",
			type: "info",
			description: "Offline mode is ready! You can now use Beatmapper without an internet connection.",
		});
	},
});

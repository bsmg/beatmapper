import { registerSW } from "virtual:pwa-register";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { setupLogger } from "bsmap";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import { AppAudioContext, AppFilestore, AppStore, AppToaster, createAppFileStorageDriver } from "./_setup";
import ErrorBoundary from "./components/app/templates/error-boundary";
import PendingBoundary from "./components/app/templates/pending-boundary";
import { AudioContextProvider, BeatmapFilestoreProvider, ToasterProvider } from "./components/context";
import { routeTree } from "./routeTree.gen";

import "./index.css";

if (import.meta.env.DEV) {
	setupLogger();
}

const router = createRouter({
	routeTree: routeTree,
	defaultPendingComponent: PendingBoundary,
	defaultErrorComponent: ErrorBoundary,
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

await AppStore.setup({
	extraArgument: {
		getRouter: () => router,
		getFilestore: AppFilestore.setup({ driver: createAppFileStorageDriver({ name: "entries" }) }),
		getToaster: AppToaster.setup({ placement: "bottom-end", overlap: true, max: 8 }),
		getAudioContext: AppAudioContext.setup({}),
	},
});

const root = document.getElementById("root");

if (!root) {
	throw new Error("No root element.");
}

createRoot(root).render(
	<BeatmapFilestoreProvider value={AppFilestore.instance}>
		<ToasterProvider value={AppToaster.instance}>
			<AudioContextProvider value={AppAudioContext.instance}>
				<Provider store={AppStore.instance}>
					<QueryClientProvider client={new QueryClient()}>
						<RouterProvider router={router} />
					</QueryClientProvider>
				</Provider>
			</AudioContextProvider>
		</ToasterProvider>
	</BeatmapFilestoreProvider>,
);

const updateSW = registerSW({
	onNeedRefresh() {
		return AppToaster.instance.create({
			id: "pwa-update",
			type: "loading",
			title: "New Update Available",
			description: "A new update is available! Click the button to reload the app and move to the new update.",
			closable: true,
			action: {
				label: "Reload",
				onClick: () => {
					updateSW(true);
				},
			},
		});
	},
	onOfflineReady() {
		return AppToaster.instance.create({
			id: "offline-ready",
			type: "info",
			description: "Offline mode is ready! You can now use Beatmapper without an internet connection.",
		});
	},
});

import { registerSW } from "virtual:pwa-register";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import { getRouter, setupRouter } from "./router";
import { getAppStore, getAppToaster, setupAppStore } from "./setup";

import "./index.css";

setupRouter();
setupAppStore();

const root = document.getElementById("root");

if (!root) {
	throw new Error("No root element.");
}

const store = await getAppStore();

createRoot(root).render(
	<Provider store={store}>
		<QueryClientProvider client={new QueryClient()}>
			<RouterProvider router={getRouter()} />
		</QueryClientProvider>
	</Provider>,
);

const updateSW = registerSW({
	onNeedRefresh() {
		const toaster = getAppToaster();

		return toaster?.create({
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
		const toaster = getAppToaster();

		return toaster?.create({
			id: "offline-ready",
			type: "info",
			description: "Offline mode is ready! You can now use Beatmapper without an internet connection.",
		});
	},
});

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import { routeTree } from "./routeTree.gen";
import { store } from "./setup";

import "./index.css";

const root = document.getElementById("root");
if (!root) throw new Error("No root element.");

export const router = createRouter({ routeTree: routeTree });

const queryClient = new QueryClient();

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
createRoot(root).render(
	<Provider store={store}>
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
		</QueryClientProvider>
	</Provider>,
);

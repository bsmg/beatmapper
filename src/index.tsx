import isPropValid from "@emotion/is-prop-valid";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { StyleSheetManager, type WebTarget } from "styled-components";

import { routeTree } from "./routeTree.gen";
import { store } from "./setup";

const root = document.getElementById("root");
if (!root) throw new Error("No root element.");

export const router = createRouter({ routeTree: routeTree });

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
createRoot(root).render(
	<Provider store={store}>
		<StyleSheetManager shouldForwardProp={shouldForwardProp}>
			<RouterProvider router={router} />
		</StyleSheetManager>
	</Provider>,
);

function shouldForwardProp(propName: string, target: WebTarget) {
	if (typeof target === "string") return isPropValid(propName);
	return true;
}

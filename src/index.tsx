import isPropValid from "@emotion/is-prop-valid";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { Route, RouterProvider, createBrowserRouter, createRoutesFromChildren } from "react-router-dom";
import { StyleSheetManager, type WebTarget } from "styled-components";

import { createAppStore } from "./store/setup";

import App from "./components/App";

const store = createAppStore();

const root = document.getElementById("root");
if (!root) throw new Error("No root element.");

const router = createBrowserRouter(createRoutesFromChildren(<Route path="*" element={<App />} />));

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

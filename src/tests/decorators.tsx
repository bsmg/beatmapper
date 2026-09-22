import { Canvas } from "@react-three/fiber";
import type { Store } from "@reduxjs/toolkit";
import { type AnyRouter, createMemoryHistory, createRootRoute, createRoute, createRouter, RouterContextProvider } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Provider as StoreProvider } from "react-redux";
import type { Scene } from "three";

import type { Decorator } from "./utils";

export function withRouter(initialEntries = ["/"]): Decorator<{ router: AnyRouter }> {
	const rootRoute = createRootRoute();

	const testRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: "*",
	});

	return () => {
		const router = createRouter({
			routeTree: rootRoute.addChildren([testRoute]),
			history: createMemoryHistory({ initialEntries }),
			defaultPendingMinMs: 0,
		});

		return {
			render: (node: ReactNode) => <RouterContextProvider router={router}>{node}</RouterContextProvider>,
			context: { router },
		};
	};
}

export function withScene(): Decorator<{ getScene: () => Promise<Scene> }> {
	let scene: Scene | null;

	return () => {
		return {
			render: (node: ReactNode) => (
				<Canvas
					onCreated={(ctx) => {
						scene = ctx.scene;
					}}
				>
					{node}
				</Canvas>
			),
			context: {
				getScene: async () => {
					if (!scene) {
						throw new Error("R3F Scene not initialized yet. Ensure the component has finished rendering.");
					}
					return scene;
				},
			},
		};
	};
}

export function withStore<TStore extends Store>(store: TStore): Decorator<{ store: TStore }> {
	return () => ({
		render: (node: ReactNode) => <StoreProvider store={store}>{node}</StoreProvider>,
		context: { store },
	});
}

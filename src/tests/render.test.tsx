/// <reference types="vitest/browser" />
import { configureStore, createSlice } from "@reduxjs/toolkit";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useSelector } from "react-redux";
import { Mesh, Scene } from "three";
import { describe, expect, it, vi } from "vitest";

import { withRouter, withScene, withStore } from "./decorators";
import { createRender } from "./utils";

const alert = vi.mockObject(self.alert);

describe(createRender.name, () => {
	const render = createRender();

	function Component({ title }: { title: string }) {
		return (
			<div>
				<h1>{title}</h1>
				<button type="button" onClick={() => alert("Clicked!")}>
					Click Me
				</button>
			</div>
		);
	}

	it("should render a component in the browser and interact with it", async () => {
		const screen = await render(<Component title="Vite + Vitest Browser Mode" />);

		const heading = screen.getByRole("heading", { name: "Vite + Vitest Browser Mode" });
		await expect.element(heading).toBeInTheDocument();

		const button = screen.getByRole("button", { name: "Click Me" });
		await expect.element(button).toBeInTheDocument();

		await button.click();
		expect(alert).toHaveBeenCalled();
	});
});

describe(withRouter.name, () => {
	const render = createRender(withRouter());

	function Navigator() {
		const navigate = useNavigate();
		const location = useLocation();

		return (
			<div>
				<span data-testid="current-path">Current Path: {location.pathname}</span>
				<button type="button" onClick={() => navigate({ to: "/convert" })}>
					Go to Dashboard
				</button>
			</div>
		);
	}

	it("should render the router context and handle navigation", async () => {
		const screen = await render(<Navigator />);

		const span = screen.getByTestId("current-path");
		await expect.element(span).toHaveTextContent("Current Path: /");

		const button = screen.getByRole("button", { name: "Go to Dashboard" });
		await button.click();

		await expect.element(span).toHaveTextContent("Current Path: /convert");
	});
});

describe(withScene.name, () => {
	function Box() {
		return (
			<mesh name="test-box">
				<boxGeometry args={[1, 1, 1]} />
				<meshBasicMaterial color="hotpink" />
			</mesh>
		);
	}

	const render = createRender(withScene());

	it("should render and update the scene", async () => {
		const { getScene } = await render(<Box />);
		const scene = await vi.waitFor(getScene);

		expect(scene).toBeInstanceOf(Scene);

		const mesh = scene.getObjectByName("test-box");
		expect(mesh).toBeDefined();
		expect(mesh).toBeInstanceOf(Mesh);
	});
});

describe(withStore.name, () => {
	const counter = createSlice({
		name: "counter",
		initialState: { value: 42 },
		reducers: {
			increment: (state) => {
				state.value += 1;
			},
		},
	});

	const store = configureStore({
		reducer: { counter: counter.reducer },
	});

	const render = createRender(withStore(store));

	function Counter() {
		const value = useSelector((state: ReturnType<typeof store.getState>) => state.counter.value);
		return <div data-testid="counter">Count: {value}</div>;
	}

	it("should render and update the store context", async () => {
		const screen = await render(<Counter />);

		await expect.element(screen.getByTestId("counter")).toHaveTextContent("Count: 42");

		expect(screen.store).toBeDefined();
		expect(screen.store.getState().counter.value).toBe(42);
	});
});

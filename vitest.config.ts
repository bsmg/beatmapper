import { existsSync } from "node:fs";

import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { default as react } from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

import { defineVersion, TANSTACK_ROUTER_OPTIONS } from "./vite.config.ts";

const instances: Array<{ browser: "chromium" | "firefox" | "webkit" }> = [];

export default defineConfig(async () => {
	if (instances.length === 0) {
		try {
			const { chromium, firefox, webkit } = await import("playwright");

			const targets = [chromium, firefox, webkit];

			for (const engine of targets) {
				const name = engine.name() as "chromium" | "firefox" | "webkit";

				try {
					const execPath = engine.executablePath();

					if (!execPath || !existsSync(execPath)) {
						throw `Binary executable not found on disk (you may need to install it via playwright).`;
					}
					// we can skip a browser instance if it fails to launch (or is otherwise not supported) on the host's os.
					await engine
						.launch({ headless: true })
						.then((browser) => browser.close())
						.catch(() => {
							throw `Cannot launch instance (you may be missing dependencies).`;
						});

					instances.push({ browser: name });
				} catch (error) {
					console.error(`Skipping integration tests for "${name}" browser instance:`, error);
				}
			}
		} catch {
			console.error(`Failed to import 'playwright'.`);
		}
	}

	return {
		plugins: [react(), tanstackRouter(TANSTACK_ROUTER_OPTIONS)],
		define: {
			version: await defineVersion(),
		},
		resolve: {
			tsconfigPaths: true,
		},
		test: {
			projects: [
				{
					test: {
						name: "unit",
						include: ["src/**/*.test.ts"],
					},
				},
				{
					test: {
						name: "integration",
						include: ["src/**/*.test.tsx"],
						browser: {
							instances: instances,
							provider: playwright(),
							enabled: true,
						},
					},
				},
			],
		},
	};
});

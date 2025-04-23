import { fileURLToPath } from "node:url";
import { type UserConfig, defineConfig } from "vite";

import { default as pandacss } from "@pandacss/dev/postcss";
import { default as react } from "@vitejs/plugin-react";
import { VitePWA as pwa } from "vite-plugin-pwa";

import packageJson from "./package.json";

async function startVelite(isDev: boolean, isBuild: boolean) {
	if (!process.env.VELITE_STARTED && (isDev || isBuild)) {
		process.env.VELITE_STARTED = "1";
		const { build } = await import("velite");
		await build({ watch: isDev, clean: !isDev });
	}
}

// https://vitejs.dev/config/
export default defineConfig(async (ctx) => {
	const isDev = ctx.mode === "development";
	const isBuild = ctx.command === "build";

	await startVelite(isDev, isBuild);

	return {
		plugins: [
			react(),
			pwa({
				registerType: "autoUpdate",
				workbox: {
					maximumFileSizeToCacheInBytes: 2621440, // 2.5 MiB
				},
			}),
		],
		define: {
			global: "window",
			version: `\"${packageJson.version}\"`,
		},
		resolve: {
			alias: {
				$: fileURLToPath(new URL("./src", import.meta.url)),
				"$:styled-system": fileURLToPath(new URL("./styled-system", import.meta.url)),
				"velite:content": fileURLToPath(new URL("./.velite", import.meta.url)),
			},
		},
		assetsInclude: ["**/*.glsl"],
		build: {
			commonjsOptions: { transformMixedEsModules: true }, // Change
		},
		css: {
			postcss: {
				plugins: [pandacss({})],
			},
		},
		esbuild: {
			supported: {
				"top-level-await": true,
			},
		},
		optimizeDeps: {
			esbuildOptions: {
				loader: {
					".js": "jsx",
				},
			},
		},
	} as UserConfig;
});

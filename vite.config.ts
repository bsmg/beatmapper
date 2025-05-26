import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { type UserConfig, defineConfig } from "vite";

import { default as pandacss } from "@pandacss/dev/postcss";
import { default as react } from "@vitejs/plugin-react";
import { type VitePWAOptions, VitePWA as pwa } from "vite-plugin-pwa";

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

	const PWA_OPTIONS: Partial<VitePWAOptions> = {
		registerType: "prompt",
		includeAssets: ["/favicon.ico"],
		manifest: {
			short_name: "Beatmapper",
			name: "Beatmapper",
			icons: [
				{
					src: "pwa-64x64.png",
					sizes: "64x64",
					type: "image/png",
				},
				{
					src: "pwa-192x192.png",
					sizes: "192x192",
					type: "image/png",
				},
				{
					src: "pwa-512x512.png",
					sizes: "512x512",
					type: "image/png",
					purpose: "any",
				},
				{
					src: "maskable-icon-512x512.png",
					sizes: "512x512",
					type: "image/png",
					purpose: "maskable",
				},
			],
			id: "beatmapper",
			start_url: ".",
			display: "fullscreen",
			orientation: "landscape",
			theme_color: "hsl(222, 25%, 12%)",
			background_color: "hsl(222, 30%, 7%)",
		},
		workbox: {
			globPatterns: ["**/*"],
			maximumFileSizeToCacheInBytes: 20971520, // 20 MB
		},
	};

	let version = packageJson.version;
	if (isDev) {
		const hash = execSync("git rev-parse --short=7 HEAD");
		version += `-dev.${hash.toString().trim()}`;
	}

	return {
		plugins: [react(), pwa(PWA_OPTIONS)],
		define: {
			global: "window",
			version: `\"${version}\"`,
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

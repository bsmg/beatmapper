import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { type UserConfig, defineConfig } from "vite";

import { default as pandacss } from "@pandacss/dev/postcss";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { default as react } from "@vitejs/plugin-react";
import { VitePWA, type VitePWAOptions } from "vite-plugin-pwa";

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
			description: "A web-based level editor for Beat Saber™.",
			screenshots: [
				{
					src: "screenshot-wide-1920x1080.png",
					sizes: "1920x1080",
					type: "image/png",
					form_factor: "wide",
				},
			],
			start_url: ".",
			display: "fullscreen",
			orientation: "landscape",
			theme_color: "hsl(48, 100%, 60%)",
			background_color: "hsl(222, 32%, 4%)",
		},
		workbox: {
			globPatterns: ["**/*"],
			maximumFileSizeToCacheInBytes: 20971520, // 20 MB
		},
	};

	const TSR_OPTIONS: Parameters<typeof TanStackRouterVite>[0] = {
		virtualRouteConfig: "src/routes.ts",
	};

	let version = packageJson.version;
	if (isDev) {
		const hash = execSync("git rev-parse --short=7 HEAD");
		version += `-dev.${hash.toString().trim()}`;
	}

	return {
		plugins: [react(), VitePWA(PWA_OPTIONS), TanStackRouterVite(TSR_OPTIONS)],
		assetsInclude: ["**/*.glsl"],
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
	} as UserConfig;
});

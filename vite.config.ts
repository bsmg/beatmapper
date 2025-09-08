import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { default as pandacss } from "@pandacss/dev/postcss";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { default as velite } from "@velite/plugin-vite";
import { default as react } from "@vitejs/plugin-react";
import { defineConfig, type UserConfig } from "vite";
import { VitePWA, type VitePWAOptions } from "vite-plugin-pwa";

import packageJson from "./package.json" with { type: "json" };

// https://vitejs.dev/config/
export default defineConfig(async (ctx) => {
	const isDev = ctx.mode === "development";

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

	const TSR_OPTIONS: Parameters<typeof tanstackRouter>[0] = {
		virtualRouteConfig: "src/routes.ts",
	};

	let version = packageJson.version;

	if (isDev) {
		const hash = execSync("git rev-parse --short=7 HEAD");
		version += `-dev.${hash.toString().trim()}`;
	}

	return {
		plugins: [react(), VitePWA(PWA_OPTIONS), tanstackRouter(TSR_OPTIONS), velite()],
		assetsInclude: ["**/*.glsl"],
		define: {
			version: `\"${version}\"`,
		},
		resolve: {
			alias: {
				$: fileURLToPath(new URL("./src", import.meta.url)),
				"$:styled-system": fileURLToPath(new URL("./styled-system", import.meta.url)),
				"$:content": fileURLToPath(new URL("./.velite", import.meta.url)),
			},
		},
		build: {
			rollupOptions: {
				output: {
					manualChunks: (id) => {
						if (id.includes(".velite")) return "content";
						if (id.includes("node_modules")) {
							if (id.includes("acorn/dist")) return "vendor-acorn";
							if (id.includes("three.core.js")) return "vendor-three-core";
							if (id.includes("three") || id.includes("@react-three")) return "vendor-three";
							if (id.includes("@ark-ui") || id.includes("@floating-ui") || id.includes("@react-spring") || id.includes("@zag-js") || id.includes("lucide")) return "vendor-ui";
							if (id.includes("react-dom")) return "vendor-react";
							if (id.includes("@std")) return "vendor-std";
							if (id.includes("@tanstack")) return "vendor-tanstack";
							if (id.includes("bsmap")) return "vendor-bsmap";
							return "vendor";
						}
					},
				},
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

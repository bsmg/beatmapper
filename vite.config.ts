import { execSync } from "node:child_process";

import { default as pandacss } from "@pandacss/dev/postcss";
import { devtools, type TanStackDevtoolsViteConfig } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { default as velite } from "@velite/plugin-vite";
import { default as react } from "@vitejs/plugin-react";
import { defineConfig, type UserConfig } from "vite";
import { VitePWA, type VitePWAOptions } from "vite-plugin-pwa";

import packageJson from "./package.json" with { type: "json" };

// https://vitejs.dev/config/
export default defineConfig(async (ctx) => {
	const isDev = ctx.mode === "development";

	const DEVTOOLS_OPTIONS: TanStackDevtoolsViteConfig = {
		injectSource: {
			enabled: true,
			ignore: {
				files: ["node_modules", /.*\.test\.(js|ts|jsx|tsx)$/, "src/components/scene/**/*.tsx", "src/components/app/logo.tsx"],
			},
		},
	};

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
		plugins: [devtools(DEVTOOLS_OPTIONS), react(), VitePWA(PWA_OPTIONS), tanstackRouter(TSR_OPTIONS), velite()],
		assetsInclude: ["**/*.glsl"],
		define: {
			version: `"${version}"`,
		},
		resolve: {
			tsconfigPaths: true,
		},
		build: {
			cssMinify: false,
			rolldownOptions: {
				output: {
					codeSplitting: {
						groups: [
							{ name: "content", test: /\.velite/ },
							{ name: "vendor-acorn", test: /node_modules\/acorn\/dist/ },
							{ name: "vendor-three-core", test: /node_modules\/.*three\.core\.js/ },
							{ name: "vendor-three", test: /node_modules\/(three|@react-three)/ },
							{ name: "vendor-ui", test: /node_modules\/(@ark-ui|@floating-ui|@react-spring|@zag-js|lucide)/ },
							{ name: "vendor-react", test: /node_modules\/react-dom/ },
							{ name: "vendor-std", test: /node_modules\/@std/ },
							{ name: "vendor-tanstack", test: /node_modules\/@tanstack/ },
							{ name: "vendor-bsmap", test: /node_modules\/bsmap/ },
							{ name: "vendor", test: /node_modules/ },
						],
					},
				},
			},
		},
		css: {
			postcss: {
				plugins: [pandacss({})],
			},
		},
	} as UserConfig;
});

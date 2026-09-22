import { execSync } from "node:child_process";

import { default as content } from "@content-collections/vite";
import { default as pandacss } from "@pandacss/dev/postcss";
import { devtools, type TanStackDevtoolsViteConfig } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { default as react } from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA, type VitePWAOptions } from "vite-plugin-pwa";

export const VITE_PWA_OPTIONS: Partial<VitePWAOptions> = {
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

export const TANSTACK_DEVTOOLS_OPTIONS: TanStackDevtoolsViteConfig = {
	injectSource: {
		enabled: true,
		ignore: {
			files: ["node_modules", /.*\.test\.(js|ts|jsx|tsx)$/, "src/components/scene/**/*.tsx", "src/components/app/logo.tsx"],
		},
	},
};

export const TANSTACK_ROUTER_OPTIONS: Parameters<typeof tanstackRouter>[0] = {
	virtualRouteConfig: "src/routes.ts",
};

export async function defineVersion(isDev?: boolean) {
	const { default: packageJson } = await import("./package.json", { with: { type: "json" } });

	let version = packageJson.version;

	if (isDev) {
		const hash = execSync("git rev-parse --short=7 HEAD");
		version += `-dev.${hash.toString().trim()}`;
	}

	return `"${version}"`;
}

// https://vitejs.dev/config/
export default defineConfig(async (ctx) => {
	return {
		plugins: [devtools(TANSTACK_DEVTOOLS_OPTIONS), react(), VitePWA(VITE_PWA_OPTIONS), tanstackRouter(TANSTACK_ROUTER_OPTIONS), content()],
		assetsInclude: ["**/*.glsl"],
		define: {
			version: await defineVersion(ctx.mode === "development"),
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
							{ name: "content", test: /\.content-collections/ },
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
				// @ts-expect-error as directed (chakra-ui/panda#3258)
				plugins: [pandacss({})],
			},
		},
	};
});

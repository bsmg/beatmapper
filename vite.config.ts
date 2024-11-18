import { fileURLToPath } from "node:url";
import type { Pluggable } from "unified";
import { type Plugin, type UserConfig, defineConfig } from "vite";

import { default as mdx } from "@mdx-js/rollup";
import { default as react } from "@vitejs/plugin-react";
import { VitePWA as pwa } from "vite-plugin-pwa";

import { default as rehypeMdxImportMedia } from "rehype-mdx-import-media";
import { default as rehypeSlug } from "rehype-slug";
import { default as remarkFrontmatter } from "remark-frontmatter";
import { default as remarkGfm } from "remark-gfm";
import { default as remarkMdxFrontmatter } from "remark-mdx-frontmatter";
import { remarkMdxToc } from "remark-mdx-toc";

import packageJson from "./package.json";

function markdown() {
	return {
		enforce: "pre",
		...mdx({
			providerImportSource: "@mdx-js/react",
			remarkPlugins: [
				remarkGfm,
				remarkFrontmatter,
				[remarkMdxFrontmatter, { name: "frontMatter" }],
				[remarkMdxToc, { name: "tableOfContents" }] as Pluggable,
				//
			],
			rehypePlugins: [
				rehypeSlug,
				rehypeMdxImportMedia,
				//
			],
		}),
	} as Plugin;
}

// https://vitejs.dev/config/
export default defineConfig((ctx) => {
	return {
		plugins: [react(), markdown(), pwa({ registerType: "autoUpdate" })],
		define: {
			global: "window",
			version: `\"${packageJson.version}\"`,
		},
		resolve: {
			alias: {
				$: fileURLToPath(new URL("./src", import.meta.url)),
			},
		},
		assetsInclude: ["**/*.glsl"],
		build: {
			commonjsOptions: { transformMixedEsModules: true }, // Change
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

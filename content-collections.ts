import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, resolve } from "node:path";
import { cwd } from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

import type { Assign } from "@ark-ui/react";
import type { TocItemData } from "@ark-ui/react/toc";
import { defineCollection, defineConfig } from "@content-collections/core";
import { slugify } from "@std/text/unstable-slugify";
import { defineHastPlugin, type Features, mdxToJs } from "satteri";
import { default as expressiveCode, type SatteriExpressiveCodeOptions } from "satteri-expressive-code";
import { nullable, number, object, optional, string } from "valibot";

declare module "satteri" {
	export interface DataMap {
		getToc: () => Assign<TocItemData, { label: string }>[];
	}
}

function toc() {
	const toc: Assign<TocItemData, { label: string }>[] = [];

	return defineHastPlugin({
		name: "satteri-toc",
		element: {
			filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
			visit(node, ctx) {
				const depth = parseInt(node.tagName.charAt(1), 10);
				const label = ctx.textContent(node);
				const value = slugify(label);

				if (!node.properties.id) {
					ctx.setProperty(node, "id", value);
				}
				if (depth === 2) {
					toc.push({ value: node.properties.id ?? value, depth, label } as Assign<TocItemData, { label: string }>);
				}

				ctx.data.getToc = () => toc;
			},
		},
	});
}

function callouts() {
	const ALERT_REGEX = /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i;

	return defineHastPlugin({
		name: "satteri-alerts",
		element: {
			filter: ["blockquote"],
			visit(node, ctx) {
				const pNode = node.children.find((c) => c.type === "element" && c.tagName === "p");
				const text = pNode && "children" in pNode ? pNode.children.find((c) => c.type === "text") : null;
				const match = text.value.match(ALERT_REGEX);

				if (match) {
					const classes = Array.from(node.properties.className ?? []);
					ctx.setProperty(node, "className", [...classes, `alert-${match[1].toLowerCase()}`]);
					ctx.setProperty(text, "value", text.value.replace(ALERT_REGEX, ""));
				}
			},
		},
	});
}

function inlineMedia() {
	return defineHastPlugin({
		name: "satteri-inline-media",
		element: {
			filter: ["img"],
			visit(node, ctx) {
				if ([".mp4", ".webm", ".ogv", ".mov", ".m4v"].some((ext) => node.properties.src.toLowerCase().endsWith(ext))) {
					ctx.replaceNode(node, { ...node, tagName: "video", properties: { ...node.properties, controls: true, alt: undefined } });
				}
			},
		},
	});
}

function staticAssets(options = { staticDir: join(cwd(), "public/static") }) {
	const INVALID_LOCAL_ASSET = /^(?:[a-zA-Z]+:|\/\/|#|\?)/;
	const SANITIZE_ASSET = /^([^?#]*)(.*)$/;

	return defineHastPlugin({
		name: "satteri-static-assets",
		element: {
			filter: ["img", "video"],
			async visit(node, ctx) {
				if (INVALID_LOCAL_ASSET.test(node.properties.src)) return;
				const [_, cleanUrl, suffix] = node.properties.src.match(SANITIZE_ASSET);
				const filePath = fileURLToPath(ctx.fileURL);

				try {
					const sourcePath = cleanUrl.startsWith("/") ? resolve(cwd(), cleanUrl.slice(1)) : resolve(dirname(filePath), cleanUrl);

					const buffer = await readFile(sourcePath);
					const ext = extname(sourcePath);
					const hash = createHash("md5").update(buffer).digest("hex").slice(0, 8);
					const filename = `${basename(sourcePath, ext)}-${hash}${ext}`;

					const destPath = join(options.staticDir, filename);
					await mkdir(options.staticDir, { recursive: true });
					await writeFile(destPath, buffer);

					const publicUrl = join(`/${basename(options.staticDir)}/`, filename + suffix);
					ctx.setProperty(node, "src", publicUrl);
				} catch (err) {
					console.warn(`Failed to copy asset "${cleanUrl}" referenced in "${filePath}":`, err);
				}
			},
		},
	});
}

const features: Features = {
	gfm: true,
	frontmatter: true,
};
const code: SatteriExpressiveCodeOptions = {
	themes: ["github-light-default", "github-dark-default"],
	styleOverrides: { frames: { shadowColor: "transparent" } },
	themeCssSelector: (theme) => `.${theme.type}`,
};

function resolveId(path: string, collection: string) {
	const [...splat] = path.replace(join(cwd(), `src/content/${collection}`), "").split("\\");
	return splat.join("/").replace("/index", "").replace(".local", "").replace(".mdx", "");
}

const docs = defineCollection({
	name: "Doc",
	directory: "src/content/docs",
	include: "**/*.mdx",
	schema: object({
		content: string(),
		title: string(),
		subtitle: optional(string()),
		category: optional(nullable(string()), null),
		order: optional(number(), 0),
		prev: optional(string()),
		next: optional(string()),
	}),
	transform: async ({ content, ...document }, ctx) => {
		const result = await mdxToJs(content, {
			features: features,
			outputFormat: "function-body",
			fileURL: pathToFileURL(join(ctx.collection.directory, document._meta.filePath)),
			hastPlugins: [toc(), callouts(), inlineMedia(), staticAssets(), expressiveCode(code)],
		});
		return { ...document, id: resolveId(document._meta.filePath, "docs"), code: result.code, tableOfContents: result.data.getToc?.() ?? [] };
	},
});

const prompts = defineCollection({
	name: "Prompt",
	directory: "src/content/prompts",
	include: "**/*.mdx",
	schema: object({
		content: string(),
		title: string(),
	}),
	transform: async ({ content, ...document }, ctx) => {
		const result = mdxToJs(content, {
			features: features,
			outputFormat: "function-body",
			fileURL: pathToFileURL(join(ctx.collection.directory, document._meta.filePath)),
		});
		return { ...document, id: resolveId(document._meta.filePath, "prompts"), code: result.code };
	},
});

export default defineConfig({
	content: [docs, prompts],
});

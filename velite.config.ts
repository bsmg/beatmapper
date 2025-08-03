import { defineCollection, defineConfig, s } from "velite";

import { join } from "node:path";
import { cwd } from "node:process";
import { type RehypeExpressiveCodeOptions, default as rehypeExpressiveCode } from "rehype-expressive-code";
import { type IOptions, rehypeGithubAlerts } from "rehype-github-alerts";
import { default as rehypeSlug } from "rehype-slug";
import { default as remarkGfm } from "remark-gfm";

const mdx = s.mdx({
	remarkPlugins: [[remarkGfm]],
	rehypePlugins: [
		[rehypeSlug],
		[rehypeGithubAlerts, { build: (alert, children) => ({ type: "element", tagName: "blockquote", properties: { className: [`alert-${alert.keyword.toLowerCase()}`] }, children: [...children] }) } as Partial<IOptions>],
		[rehypeExpressiveCode, { themes: ["github-light-default", "github-dark-default"], styleOverrides: { frames: { shadowColor: "transparent" } }, themeCssSelector: (theme) => `.${theme.type}` } as RehypeExpressiveCodeOptions],
	],
});

function resolveId(path: string, collection: string) {
	const [...splat] = path.replace(join(cwd(), `src/content/${collection}`), "").split("\\");
	return splat.join("/").replace("/index", "").replace(".local", "").replace(".mdx", "").slice(1);
}

const docs = defineCollection({
	name: "Doc",
	pattern: "docs/**/*.mdx",
	schema: s.object({ title: s.string(), subtitle: s.string().optional(), category: s.nullable(s.string()).default(null), order: s.number().default(0), prev: s.string().optional(), next: s.string().optional(), code: mdx, tableOfContents: s.toc() }).transform((data, ctx) => {
		if (!ctx.meta.path || typeof ctx.meta.path !== "string") return { id: "", ...data };
		return { id: resolveId(ctx.meta.path, "docs"), ...data };
	}),
});

const prompts = defineCollection({
	name: "Prompt",
	pattern: "prompts/**/*.mdx",
	schema: s.object({ title: s.string(), code: mdx }).transform((data, ctx) => {
		if (!ctx.meta.path || typeof ctx.meta.path !== "string") return { id: "", ...data };
		return { id: resolveId(ctx.meta.path, "prompts"), ...data };
	}),
});

export default defineConfig({
	root: "src/content",
	output: {
		clean: true,
	},
	collections: {
		docs: docs,
		prompts: prompts,
	},
});
